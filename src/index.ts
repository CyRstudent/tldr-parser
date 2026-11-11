// Main parse logic
import parseRaw from './parser.js';

// Types and interfaces
import {
	CLIENT_STRATEGIES,
	type TLDRInfo,
	type ParseOptions,
} from './types/index.js';

// Custom error classes
import { InvalidQueryError, PageNotFoundError } from './errors/index.js';

import { execa, ExecaError } from 'execa';

const reg = /^[a-zA-Z0-9_\-+\s]{1,50}$/;

export default async function parse(
	query: string,
	options: ParseOptions = {},
): Promise<TLDRInfo> {
	// Step 1: Check for possible injections
	const sanitized = query.trim();
	if (!sanitized) {
		throw new InvalidQueryError(query, 'Query cannot be empty');
	}

	if (!reg.test(sanitized)) {
		throw new InvalidQueryError(
			query,
			'The query must be alphanumeric (hyphens and + allowed), and between 1 and 50 chars',
		);
	}
	if (sanitized.startsWith('-')) {
		throw new InvalidQueryError(
			query,
			'The query must not start with a hyphen',
		);
	}

	if (!options.client) {
		options.client = 'tlrc';
	}
	if (!options.binary) {
		options.binary = 'tldr';
	}
	const strat = CLIENT_STRATEGIES[options.client];

	const queryArgs = sanitized.split(/\s+/);
	const args = strat.buildArgs(queryArgs);

	let output;
	try {
		output = await execa(options.binary, args);
	} catch (err) {
		if (err instanceof ExecaError) {
			if (strat.isPageNotFound(err.message)) {
				throw new PageNotFoundError(sanitized, { cause: err });
			}
		}
		throw err;
	}
	return parseRaw(output.stdout, options.stripUsage ?? true);
}

export * from './types/index.js';
export * from './errors/index.js';
