import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import onlyWarn from 'eslint-plugin-only-warn';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import js from '@eslint/js';

export default [
    js.configs.recommended,

    prettier,

    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    },

    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.eslint.json'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'off'
        }
    },

    onlyWarn,

    {
        ignores: ['dist/**']
    }
];
