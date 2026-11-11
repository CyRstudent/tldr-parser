import { TLDError } from './tldr.js';

/**
 * Throws when a provided search query violates any of the specified rules in the main function
 */
export class InvalidQueryError extends TLDError {
	/**
	 * The query containing the violation
	 */
	public readonly query: string;
	/**
	 *
	 * @param query The query containing the violation
	 * @param reason The exact violation produced in the query
	 */
	constructor(query: string, reason: string) {
		super(`Invalid query "${query}": ${reason}`);
		this.query = query;
	}
}
