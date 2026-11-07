import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['dist/**', 'solver/**'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
            'max-len': ['error', {
                code: 200,
                ignoreComments: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            }],
        },
    }
);
