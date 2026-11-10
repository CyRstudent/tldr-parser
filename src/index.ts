import parseRaw from "./parser.js";
import type { Example, TLDRInfo } from "./types.js";

import { execa, ExecaError } from "execa";

export default async function parse(query: string): Promise<TLDRInfo> {
	// Step 1: Check for possible injections
	const sanitized = query.trim();

	/**
	 * The RegEx contains the following checks:
	 * Only alphanumeric characters
	 * Hyphens allowed
	 * String length l such that 1 <= l <= 50 to prevent massive, memory-overloading inputs
	 */
	const reg = /^[a-zA-Z0-9_\-\s]{1,50}$/;
	if (!reg.test(sanitized)) {
		throw new Error(
			"The query must be alphanumeric (hyphens allowed) and 1 <= query.length <=50",
		);
	}
	if (sanitized.startsWith("-")) {
		throw new Error("Query must not start with a hyphen");
	}

	const splt = sanitized.split(/\s+/);
	let output;
	try {
		output = await execa("tldr", ["-R", "--", ...splt]);
	} catch (err) {
		if (err instanceof ExecaError) {
			const splt = err.message.split("\n");
			if (splt[2]?.startsWith("error: page not found")) {
				return {
					name: "Command not found",
					description: "",
					examples: [],
				};
			}
		}
		throw err;
	}
	return parseRaw(output.stdout);
}
