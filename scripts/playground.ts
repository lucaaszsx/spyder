import { readdirSync, existsSync, statSync } from 'fs';
import { select } from '@inquirer/prompts';
import { spawnSync } from 'child_process';
import { join } from 'path';

const PLAYGROUND_PATH = 'playground';

function getFiles(dir: string, base = PLAYGROUND_PATH): string[] {
    if (!existsSync(dir)) return [];

    return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        const rel = join(base, entry).replace(PLAYGROUND_PATH + '/', '');

        if (statSync(full).isDirectory()) return getFiles(full, join(base, entry));
        if (entry.endsWith('.ts')) return [rel];

        return [];
    });
}

const arg = process.argv[2];
const files = getFiles(PLAYGROUND_PATH).map((file) => ({ value: file, name: file }));

if (!arg && files.length === 0) {
    console.error('No playground files found.');
    process.exit(1);
}

const file =
    arg ??
    (await select({
        message: 'Select a playground file:',
        choices: files
    }));

spawnSync('tsx', ['watch', join(PLAYGROUND_PATH, file)], { stdio: 'inherit' });
