// Main parse logic
import parseRaw from './parser.js';

// Types and interfaces
import {
	CLIENT_STRATEGIES,
	type TLDRInfo,
	type ParseOptions,
	type ResolvedOptions,
} from './types/index.js';

// Custom error classes
import { InvalidQueryError, PageNotFoundError } from './errors/index.js';

import { execa, ExecaError } from 'execa';

/**
 * The default function of the package, parsing the output of the tldr command
 * @param query The command/subcommand to parse
 * @param options Options to specify client used, binary path to the tool and whether stripped examples are wanted
 * @returns A promise containing the parsed output as a TLDRInfo object.
 */
export default async function parse(
	query: string,
	options: ParseOptions = {},
): Promise<TLDRInfo> {
	const resOptions: ResolvedOptions = {
		client: options.client ?? 'tlrc',
		binary: options.binary ?? 'tldr',
		stripUsage: options.stripUsage ?? true,
		maxChar: options.maxChar ?? 50,
		allowedNAChars: options.allowedNAChars ?? ['+', '-'],
	};
	const sanitized = query.trim();
	if (!sanitized) {
		throw new InvalidQueryError(query, 'Query cannot be empty');
	}
	if (sanitized.length > resOptions.maxChar) {
		throw new InvalidQueryError(
			query,
			`Query exceeds the ${resOptions.maxChar} character(s) limit`,
		);
	}
	const escaped = resOptions.allowedNAChars.map((c) =>
		c.replace(/[-[\]\\^]/g, '\\$&'),
	);
	const pattern = new RegExp(`^[a-zA-Z0-9_\\-+\\s${escaped.join('')}]$`);
	if (!pattern.test(sanitized)) {
		throw new InvalidQueryError(query, 'Query contains invalid characters');
	}
	if (sanitized.startsWith('-')) {
		throw new InvalidQueryError(
			query,
			'The query must not start with a hyphen',
		);
	}
	const strat = CLIENT_STRATEGIES[resOptions.client];

	const queryArgs = sanitized.split(/\s+/);
	const args = strat.buildArgs(queryArgs);

	let output;
	try {
		output = await execa(resOptions.binary, args);
	} catch (err) {
		if (err instanceof ExecaError) {
			if (strat.isPageNotFound(err.message)) {
				throw new PageNotFoundError(sanitized, { cause: err });
			}
		}
		throw err;
	}
	return parseRaw(output.stdout, resOptions.stripUsage);
}

export * from './types/index.js';
export * from './errors/index.js';
