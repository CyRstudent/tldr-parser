import parseRaw from './parser.js';
import { describe, test, expect } from 'vitest';

describe('parseRaw', () => {
	test('Parses the name correctly', () => {
		const res = parseRaw('# git\n> Distributed version control system');
		expect(res.name).toBe('git');
	});
	test('Parses the description correctly', () => {
		const res = parseRaw('# git\n> Distributed version control system');
		expect(res.description).toBe('Distributed version control system');
	});
	test('Parses a case correctly', () => {
		const res = parseRaw(
			'- Create an empty Git repository:\n `git init`',
			false,
		);
		expect(res.examples.length).toBeGreaterThan(0);
		expect(res.examples[0]?.description).toBe(
			'Create an empty Git repository:',
		);
		expect(res.examples[0]?.usage).toBe('`git init`');
	});
	test('Strips out the usage correctly', () => {
		const res = parseRaw(
			'- Create an empty Git repository:\n `git init`',
			true,
		);
		expect(res.examples.length).toBeGreaterThan(0);
		expect(res.examples[0]?.usage).toBe('git init');
	});
	test('Pass invalid outputs', () => {
		const res = parseRaw('asdfñlkjasdf');
		expect(res.name).toBe('');
		expect(res.description).toBe('');
		expect(res.examples.length).toBe(0);
	});
});
