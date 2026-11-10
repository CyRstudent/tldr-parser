export const SUPPORTED_CLIENTS = [
	"tlrc",
	"tealdeer",
	"tldr-python-client",
	"tldr-ts",
];

export type TLDRClient = (typeof SUPPORTED_CLIENTS)[number];

export interface ParseOptions {
	client?: TLDRClient;
	binary?: string;
}

export interface ClientStrategy {
	buildArgs: (queryArgs: string[]) => string[];
	isPageNotfound: (stderr: string) => boolean;
}
