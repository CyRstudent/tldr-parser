import { describe, test, expect, vi, beforeEach } from 'vitest';
import parse from './index.js';
import { InvalidQueryError, PageNotFoundError } from './errors/index.js';

// Mock only the execa function, keeping ExecaError as the real class so that
// instanceof checks in index.ts still work correctly
vi.mock('execa', async (importOriginal) => {
	const real = await importOriginal();
	return { ...(real as object), execa: vi.fn() };
});

import { execa, ExecaError } from 'execa';

const mockExeca = vi.mocked(execa);

// A minimal raw markdown page to return from the fake execa call
const FAKE_PAGE = `# git push
> Push commits to a remote repository.
> More information: <https://git-scm.com/docs/git-push>.

- Push local changes to the default remote:

\`git push\`

- Push to a specific remote and branch:

\`git push {{remote}} {{branch}}\`
`;

beforeEach(() => {
	vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

describe('input validation', () => {
	test('throws InvalidQueryError for an empty query', async () => {
		await expect(parse('')).rejects.toThrow(InvalidQueryError);
		await expect(parse('')).rejects.toThrow('Query cannot be empty');
	});

	test('throws InvalidQueryError for a whitespace-only query', async () => {
		await expect(parse('   ')).rejects.toThrow(InvalidQueryError);
		await expect(parse('   ')).rejects.toThrow('Query cannot be empty');
	});

	test('throws InvalidQueryError when query exceeds maxChar limit', async () => {
		const longQuery = 'a'.repeat(51);
		await expect(parse(longQuery)).rejects.toThrow(InvalidQueryError);
		await expect(parse(longQuery)).rejects.toThrow('50 character(s) limit');
	});

	test('respects a custom maxChar limit', async () => {
		const longQuery = 'a'.repeat(10);
		await expect(parse(longQuery, { maxChar: 5 })).rejects.toThrow(
			'5 character(s) limit',
		);
	});

	test('throws InvalidQueryError for queries with disallowed characters', async () => {
		await expect(parse('git@push')).rejects.toThrow(InvalidQueryError);
		await expect(parse('git@push')).rejects.toThrow(
			'Query contains invalid characters',
		);
	});

	test('throws InvalidQueryError for queries starting with a hyphen', async () => {
		await expect(parse('-git')).rejects.toThrow(InvalidQueryError);
		await expect(parse('-git')).rejects.toThrow(
			'The query must not start with a hyphen',
		);
	});

	test('allows extra characters whitelisted via allowedNAChars', async () => {
		// '@' is disallowed by default but whitelisted here
		// execa needs to resolve for the call to reach the parse step
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);
		await expect(
			parse('git@push', { allowedNAChars: ['+', '-', '@'] }),
		).resolves.not.toThrow();
	});
});

// ---------------------------------------------------------------------------
// Successful parse
// ---------------------------------------------------------------------------

describe('successful parse', () => {
	test('returns a TLDRInfo object with the correct shape', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		const result = await parse('git push');

		expect(result).toEqual(
			expect.objectContaining({
				name: 'git push',
				description: expect.any(String),
				examples: expect.any(Array),
			}),
		);
	});

	test('strips backticks from usage by default', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		const result = await parse('git push');

		for (const example of result.examples) {
			expect(example.usage).not.toMatch(/^`|`$/);
		}
	});

	test('preserves backticks when stripUsage is false', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		const result = await parse('git push', { stripUsage: false });
		const hasBackticks = result.examples.some(
			(e) => e.usage.startsWith('`') && e.usage.endsWith('`'),
		);

		expect(hasBackticks).toBe(true);
	});

	test('examples array is not empty for a valid page', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		const result = await parse('git push');

		expect(result.examples.length).toBeGreaterThan(0);
	});
});

// ---------------------------------------------------------------------------
// Client strategies — argument building
// ---------------------------------------------------------------------------

describe('client strategies', () => {
	test('uses tlrc args by default', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		await parse('git push');

		expect(mockExeca).toHaveBeenCalledWith('tldr', [
			'-R',
			'--',
			'git',
			'push',
		]);
	});

	test('uses pythoncli args when specified', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		await parse('git push', { client: 'pythoncli' });

		expect(mockExeca).toHaveBeenCalledWith('tldr', [
			'--markdown',
			'--',
			'git',
			'push',
		]);
	});

	test('uses a custom binary when specified', async () => {
		mockExeca.mockResolvedValue({ stdout: FAKE_PAGE } as never);

		await parse('git push', { binary: '/usr/local/bin/tldr' });

		expect(mockExeca).toHaveBeenCalledWith(
			'/usr/local/bin/tldr',
			expect.any(Array),
		);
	});
});

// ---------------------------------------------------------------------------
// Error handling — execa failures
// ---------------------------------------------------------------------------

describe('execa error handling', () => {
	test('throws PageNotFoundError when tlrc reports page not found', async () => {
		const execaErr = Object.assign(new ExecaError(), {
			message: 'error: page not found for git push',
		});
		mockExeca.mockRejectedValue(execaErr);

		await expect(parse('git push')).rejects.toThrow(PageNotFoundError);
	});

	test('throws PageNotFoundError when pythoncli reports page not found', async () => {
		const execaErr = Object.assign(new ExecaError(), {
			message: 'page not found',
		});
		mockExeca.mockRejectedValue(execaErr);

		await expect(
			parse('git push', { client: 'pythoncli' }),
		).rejects.toThrow(PageNotFoundError);
	});

	test('re-throws unexpected ExecaErrors as-is', async () => {
		const execaErr = Object.assign(new ExecaError(), {
			message: 'permission denied',
		});
		mockExeca.mockRejectedValue(execaErr);

		await expect(parse('git push')).rejects.toThrow('permission denied');
		await expect(parse('git push')).rejects.not.toThrow(PageNotFoundError);
	});

	test('re-throws non-execa errors as-is', async () => {
		const genericErr = new Error('network timeout');
		mockExeca.mockRejectedValue(genericErr);

		await expect(parse('git push')).rejects.toThrow('network timeout');
	});
});
