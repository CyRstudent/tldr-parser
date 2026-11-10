import type { Example, TLDRInfo } from "./types.js";

import { execa } from "execa";

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
	const output = await execa("tldr", ["-R", "--", ...splt]);

	const lines = output.stdout.split("\n");
	let name = "";
	const descLines: string[] = [];
	const examples: Example[] = [];

	let currentExample = "";
	for (let l of lines) {
		l = l.trim();
		if (l.startsWith("# ")) {
			name = l.replace(/^#\s+/, "");
		} else if (l.startsWith("> ")) {
			descLines.push(l.replace(/^>\s+/, ""));
		} else if (l.startsWith("- ")) {
			currentExample = l.replace(/^-\s+/, "");
		} else {
			if (currentExample) {
				examples.push({
					description: currentExample,
					usage: l,
				});
				currentExample = "";
			}
		}
	}
	const obj: TLDRInfo = {
		name: name,
		description: descLines.join("\n"),
		examples: examples,
	};
	return obj;
}
