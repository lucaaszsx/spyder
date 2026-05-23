import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'node',
    target: 'es2022',
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    keepNames: true,
    shims: true,
    cjsInterop: true,
    treeshake: true
});
