import type { TLDRInfo, Example } from "./types/index.js";

export default function parseRaw(
	stdoutRaw: string,
	stripUsage: boolean = true,
): TLDRInfo {
	const lines = stdoutRaw.split(/\r?\n/);
	let name = "";
	const descLines: string[] = [];
	const examples: Example[] = [];

	let currentExample: string | null = null;

	function flushExample(): void {
		if (currentExample !== null) {
			examples.push({
				description: currentExample,
				usage: "",
			});
			currentExample = null;
		}
	}

	for (let l of lines) {
		l = l.trim();
		if (!l) continue;

		if (l.startsWith("# ")) {
			flushExample();
			if (!name) {
				name = l.replace(/^#\s+/, "").trim();
			}
		} else if (l.startsWith(">")) {
			flushExample();
			descLines.push(l.replace(/^>\s?/, ""));
		} else if (l.startsWith("- ")) {
			flushExample();
			currentExample = l.replace(/^-\s+/, "").trim();
		} else if (currentExample !== null) {
			const usage = stripUsage ? l.replace(/^`+|`+$/g, "").trim() : l;
			examples.push({
				description: currentExample,
				usage,
			});
			currentExample = null;
		}
	}

	flushExample();

	return {
		name,
		description: descLines.join("\n").trim(),
		examples,
	};
}
