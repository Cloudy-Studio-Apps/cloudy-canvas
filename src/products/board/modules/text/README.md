# Text

Free text on a board (T), and pasted text that no other module takes.

- **Tier:** core
- **Requires:** —; after: embed
- **Contributes:** kinds `TextKind`; boardCanvas: `kinds`, `pasteText`, `tools`; boardEditor: `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `text.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `text.kind.ts`, `text.tool.ts`, `text.draw.ts`, `pasted-text.ts`.

## How it works

- `text/`: `TextKind`, a free label sized to its text (`fitContent`, `removeWhenEmpty`), not resizable. The `text` tool types a draft, or edits the text of whatever it clicks.
