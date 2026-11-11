import { TLDError } from './tldr.js';

export class InvalidQueryError extends TLDError {
	public readonly query: string;
	constructor(query: string, reason: string) {
		super(`Invalid query "${query}": ${reason}`);
		this.query = query;
	}
}
