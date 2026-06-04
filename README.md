# TOON — JSON ↔ TOON Converter for VS Code

Bidirectional conversion between JSON and [TOON](https://toonformat.dev) (Token-Oriented Object Notation), with syntax highlighting and real-time validation.

TOON is a compact, human-readable format that achieves ~40% fewer tokens than JSON while maintaining lossless, deterministic round-trips. Designed for LLM contexts where every token has a cost.

## Features

- **Bidirectional conversion** — Convert JSON/JSONC to TOON and back
- **Selection-aware** — Select text in any file to convert just that fragment
- **Context menu** — Right-click `.json` or `.toon` files in the explorer
- **Keyboard shortcuts** — `Cmd+Alt+T` (to TOON), `Cmd+Alt+J` (to JSON)
- **Syntax highlighting** — Full TextMate grammar for `.toon` files
- **Real-time validation** — Errors appear in the Problems panel as you type
- **Configurable** — Indent size, delimiter style, key folding, path expansion

## Usage

### Convert in the editor

1. Open a `.json` file
2. Press `Cmd+Alt+T` (Mac) or `Ctrl+Alt+T` (Windows/Linux)
3. The file content is replaced with TOON and the language mode switches

To convert back: open the `.toon` file and press `Cmd+Alt+J` / `Ctrl+Alt+J`.

### Convert a selection

Select any JSON or TOON text in any file (`.md`, `.txt`, etc.) and:
- Right-click → "Convert JSON to TOON" or "Convert TOON to JSON"
- Or use the keyboard shortcuts

### Save as a new file

Right-click a `.json` file in the Explorer → "Convert to TOON (Save As...)"
Right-click a `.toon` file in the Explorer → "Convert to JSON (Save As...)"

A save dialog appears so you choose the output location.

### Command Palette

All commands are available via `Cmd+Shift+P`:
- `Convert JSON to TOON`
- `Convert TOON to JSON`
- `Convert to TOON (Save As...)`
- `Convert to JSON (Save As...)`

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `toon.encode.indent` | `2` | Indentation size for TOON output |
| `toon.encode.delimiter` | `,` | Delimiter for tabular arrays (`,`, `\|`, `\t`) |
| `toon.encode.keyFolding` | `off` | Dotted key folding (`off` or `safe`) |
| `toon.decode.expandPaths` | `off` | Expand dotted keys on decode (`off` or `safe`) |
| `toon.json.indent` | `2` | Indentation size for JSON output |
| `toon.openAfterConvert` | `true` | Open converted file after saving |
| `toon.validation.enable` | `true` | Enable real-time validation in Problems panel |

## Development

Requires Node.js 22+ for build tooling.

```bash
git clone https://github.com/akumarpalo/vscode.git
cd vscode
pnpm install
pnpm build
```

Press F5 in VS Code to launch the Extension Development Host.

```bash
pnpm dev          # Watch mode
pnpm lint         # Lint
pnpm test:types   # Type check
pnpm package      # Build .vsix
```

## Links

- [TOON Specification](https://github.com/toon-format/spec)
- [TOON TypeScript Library](https://github.com/toon-format/toon)
- [Issues](https://github.com/akumarpalo/vscode/issues)

## License

MIT
