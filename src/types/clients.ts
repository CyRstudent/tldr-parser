export const SUPPORTED_CLIENTS = ["tlrc", "pythoncli"] as const;

export type TLDRClient = (typeof SUPPORTED_CLIENTS)[number];

export interface ClientStrategy {
	buildArgs: (queryArgs: string[]) => string[];
	isPageNotFound: (errmsg: string) => boolean;
}

function checkLowerCase(q: string, check: string): boolean {
	return q.toLowerCase().includes(check);
}

export const CLIENT_STRATEGIES: Record<TLDRClient, ClientStrategy> = {
	tlrc: {
		buildArgs: (args) => ["-R", "--", ...args],
		isPageNotFound: (errmsg) =>
			checkLowerCase(errmsg, "error: page not found"),
	},
	pythoncli: {
		buildArgs: (args) => ["--markdown", "--", ...args],
		isPageNotFound: (errmsg) => checkLowerCase(errmsg, "page not found"),
	},
};
