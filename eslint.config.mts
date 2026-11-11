import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import type { ConfigArray } from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

const config: ConfigArray = [
	js.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		plugins: {
			prettier: eslintPluginPrettier,
		},
		languageOptions: {
			globals: {
				...globals.node,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Enforce Prettier formatting as ESLint errors
			'prettier/prettier': [
				'error',
				{
					semi: true,
					trailingComma: 'all',
					singleQuote: true,
					printWidth: 80,
					tabWidth: 4,
					useTabs: true,
				},
			],

			// TypeScript
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports' },
			],
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/await-thenable': 'error',
			eqeqeq: ['error', 'always'],
			curly: ['error', 'all'],
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
];

export default config;
