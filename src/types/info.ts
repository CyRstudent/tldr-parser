export interface Example {
	/**
	 * The description of the example
	 */
	description: string;
	/**
	 * The snippet provided
	 */
	usage: string;
}

export interface TLDRInfo {
	/**
	 * The name of the command AKA title of the query
	 */
	name: string;
	/**
	 * Description of what the provided command does
	 */
	description: string;
	/**
	 * Array of the examples
	 */
	examples: Example[];
}
