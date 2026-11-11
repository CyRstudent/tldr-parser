export const SUPPORTED_CLIENTS = ['tlrc', 'pythoncli'] as const;

/**
 * The supported CLI implementations that can be used to execute queries
 */
export type TLDRClient = (typeof SUPPORTED_CLIENTS)[number];

/**
 * The strategy to use depending on the client
 */
export interface ClientStrategy {
	/**
	 * Function that generates the arguments passed onto execa
	 * @param queryArgs The arguments passed by the user (e.g.: git merge)
	 * @returns The list of arguments including raw markdown generation, for example
	 */
	buildArgs: (queryArgs: string[]) => string[];
	/**
	 * Function to check, depending on the client and its output text, whether a page was not found
	 * @param errmsg The error message provided by execa
	 * @returns A boolean indicating whether errmsg indicates the page was missing
	 */
	isPageNotFound: (errmsg: string) => boolean;
}

/**
 * Helper function to avoid redundant code
 * @param q The original string
 * @param check The string to search
 * @returns Whether the string check is included in q
 * @internal
 */
function checkLowerCase(q: string, check: string): boolean {
	return q.toLowerCase().includes(check);
}

/**
 * A mapping of the TLDR clients and their corresponding client strategy
 *
 * @internal
 */
export const CLIENT_STRATEGIES: Record<TLDRClient, ClientStrategy> = {
	tlrc: {
		buildArgs: (args) => ['-R', '--', ...args],
		isPageNotFound: (errmsg) =>
			checkLowerCase(errmsg, 'error: page not found'),
	},
	pythoncli: {
		buildArgs: (args) => ['--markdown', '--', ...args],
		isPageNotFound: (errmsg) => checkLowerCase(errmsg, 'page not found'),
	},
};

export interface ParseOptions {
	/**
	 * The CLI tool to execute
	 * @default 'tlrc'
	 */
	client?: TLDRClient;
	/**
	 * Binary path to the executable if not available in PATH
	 * @default 'tldr'
	 */
	binary?: string;
	/**
	 * Whether to remove the backticks from the examples
	 * @default true
	 */
	stripUsage?: boolean;
	/**
	 * The max amount of characters allowed in a single query
	 * @default 50
	 */
	maxChar?: number;
}
