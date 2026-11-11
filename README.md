# tldr-parser-ts-ts

A lighweight, TypeScript-based parser designed to convert [tldr](https://github.com/tldr-pages/tldr) markdown files into structured, type-defined data.
It extracts command name, description and examples, according to [their specification](https://github.com/tldr-pages/tldr?tab=contributing-ov-file#markdown-format)

## Features

- **Spec compliant**: Parses standard tldr pages according to their specification
- **Lightweight**: Only uses a single dependency, and the code is pretty much small!
- **Client support**: Support for multiple clients, and structural design so that adding more tldr clients is easy
- **Full customization for parsing**: Use the constraints you want for parsing queries!

## Instalation

```sh
# npm
npm install tldr-parser-ts

# pnpm
pnpm install tldr-parser-ts
```
