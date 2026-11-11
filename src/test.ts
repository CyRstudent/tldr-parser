import parse from './index.js';

async function main() {
	const testCases = ['git push', 'ssh', 'git merge', 'tar'];
	for (const test of testCases) {
		const r = await parse(test);
		console.log(r);
	}
}

void main();
