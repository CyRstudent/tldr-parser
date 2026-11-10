import { TLDError } from "./tldr.js";

export class PageNotFoundError extends TLDError {
	public readonly query: string;
	constructor(query: string, options?: ErrorOptions) {
		super(`TLDR page not found for query: "${query}"`, options);
		this.query = query;
	}
}
