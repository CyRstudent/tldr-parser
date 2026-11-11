import { TLDError } from './tldr.js';

/**
 * Throws when a page was not found
 */
export class PageNotFoundError extends TLDError {
	/**
	 * The query leading to the page not found error
	 */
	public readonly query: string;
	/**
	 *
	 * @param query The query leading to the page not found error
	 * @param options Options for the error
	 */
	constructor(query: string, options?: ErrorOptions) {
		super(`TLDR page not found for query: "${query}"`, options);
		this.query = query;
	}
}
