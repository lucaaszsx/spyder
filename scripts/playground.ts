import { readdirSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { select } from '@inquirer/prompts';
import { join } from 'node:path';

interface FileEntry {
    value: string;
    name: string;
    mtime: number;
}

const PLAYGROUND_PATH = 'playground';

function getFiles(dir: string, base = PLAYGROUND_PATH): FileEntry[] {
    if (!existsSync(dir)) return [];

    return readdirSync(dir).flatMap((entry: string) => {
        const full = join(dir, entry);
        const rel = join(base, entry).replace(PLAYGROUND_PATH + '/', '');

        const stat = statSync(full);
        if (stat.isDirectory()) return getFiles(full, join(base, entry));

        // Files that starts with "_" will not be listed in the playground selection,
        // as they are meant to be imported
        if (entry.endsWith('.ts') && !entry.startsWith('_')) {
            return [
                {
                    value: rel,
                    name: rel,
                    mtime: stat.mtimeMs
                }
            ];
        }

        return [];
    });
}

const arg = process.argv[2];

const files = getFiles(PLAYGROUND_PATH)
    .sort((a, b) => b.mtime - a.mtime)
    .map(({ value, name }) => ({ value, name }));

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
