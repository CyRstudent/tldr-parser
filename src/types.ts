export interface Example {
	description: string;
	usage: string;
}

export interface TLDRInfo {
	name: string;
	description: string;
	examples: Example[];
}

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
