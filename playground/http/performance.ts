import { HttpClient } from '../../src';
import { createServer } from 'http';

// Higher RUNS = more confidence, but 1000 is sufficient
const RUNS = 1000;
const PORT = 19823;
const URL = `http://localhost:${PORT}`;

const client = new HttpClient();

// Local server without processing time for measure http client overhead in isolation,
// without network latency or server processing time
function startServer(): Promise<ReturnType<typeof createServer>> {
    const server = createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
    });

    return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function measure(fn: () => Promise<unknown>): Promise<number> {
    const start = performance.now();
    await fn();
    return performance.now() - start;
}

// Warmup is useful cuz the first requests prob will be slower due to internal setups
async function warmup(): Promise<void> {
    for (let i = 0; i < 10; i++) {
        await fetch(URL);
        await client.get(URL);
    }
}

// Interleaving fetch and HttpClient calls reduces the impact of external factors on the comparison
async function runTests(): Promise<{ fetchSamples: number[]; clientSamples: number[] }> {
    const fetchSamples: number[] = [];
    const clientSamples: number[] = [];

    console.log(`\nRunning interleaved (${RUNS}x each):`);

    for (let i = 0; i < RUNS; i++) {
        fetchSamples.push(await measure(() => fetch(URL).then((r) => r.json())));
        clientSamples.push(await measure(() => client.get(URL, { responseType: 'json' })));

        if ((i + 1) % 10 === 0)
            process.stdout.write(`  [${i + 1}/${RUNS}]\n`);
    }

    return { fetchSamples, clientSamples };
}

// mean -> average time per request
// variance -> how much the samples differ from the mean, a high variance means the measurements
//             are noisy and the mean is unreliable
// p95 -> the value below which 95% of samples fall, useful to understand worst case scenarios
// stddev -> square root of variance, expressed in the same unit (ms), used as noise floor to
//           determine if the overhead is real or just random noise
function stats(samples: number[]): { mean: number; min: number; max: number; p95: number; stddev: number } {
    const sorted = [...samples].sort((a, b) => a - b);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
    const p95 = sorted[Math.floor(samples.length * 0.95)];

    return { mean, min: sorted[0], max: sorted[sorted.length - 1], p95, stddev: Math.sqrt(variance) };
}

function report(label: string, samples: number[]): ReturnType<typeof stats> {
    const s = stats(samples);

    console.log(`\n${label}`);
    console.log(`  mean:   ${s.mean.toFixed(3)}ms`);
    console.log(`  stddev: ${s.stddev.toFixed(3)}ms`);
    console.log(`  min:    ${s.min.toFixed(3)}ms`);
    console.log(`  max:    ${s.max.toFixed(3)}ms`);
    console.log(`  p95:    ${s.p95.toFixed(3)}ms`);

    return s;
}

async function main() {
    const server = await startServer();

    console.log('Warming up...');
    await warmup();

    const { fetchSamples, clientSamples } = await runTests();

    const fetchStats = report('fetch', fetchSamples);
    const clientStats = report('HttpClient', clientSamples);

    const overhead = clientStats.mean - fetchStats.mean;
    const overheadPct = (overhead / fetchStats.mean) * 100;

    const noise = fetchStats.stddev;

    console.log(`\nOverhead: ${overhead.toFixed(3)}ms (${overheadPct.toFixed(1)}%)`);
    console.log(`Noise floor (fetch stddev): ${noise.toFixed(3)}ms`);
    console.log(
        overhead < noise
            ? `Overhead is within noise — no measurable cost.`
            : `Overhead exceeds noise — measurable cost detected.`
    );

    server.close(() => process.exit(0));
}

main();