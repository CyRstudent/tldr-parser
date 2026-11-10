import type { TLDRInfo, Example } from "./types.js";

export default function parseRaw(
	stdoutRaw: string,
	stripUsage: boolean = true,
): TLDRInfo {
	const lines = stdoutRaw.split("\n");
	let name = "";
	const descLines: string[] = [];
	const examples: Example[] = [];

	let currentExample = "";
	for (let l of lines) {
		l = l.trim();
		if (!l) continue;
		if (l.startsWith("# ")) {
			name = l.replace(/^#\s+/, "");
		} else if (l.startsWith("> ")) {
			descLines.push(l.replace(/^>\s+/, ""));
		} else if (l.startsWith("- ")) {
			currentExample = l.replace(/^-\s+/, "");
		} else if (currentExample) {
			examples.push({
				description: currentExample,
				usage: stripUsage ? l.replace(/^`+\`+$/, "").trim() : l,
			});
			currentExample = "";
		}
	}
	const obj: TLDRInfo = {
		name: name,
		description: descLines.join("\n"),
		examples: examples,
	};
	return obj;
}
