/**
 * Parent class for all the custom error classes
 */
export class TLDError extends Error {
	/**
	 *
	 * @param message Error message
	 * @param options Error options
	 */
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = new.target.name;
	}
}
