# Sticky notes

Sticky notes (S) in the board's colors, with quick-connect dots.

- **Tier:** feature
- **Requires:** connector
- **Contributes:** kinds `StickyKind`; boardCanvas: `kinds`, `options`, `tools`; boardEditor: `selectionPanels`, `toolPanels`, `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `sticky.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `sticky.kind.ts`, `sticky.tool.ts`, `sticky.draw.ts`, `ui/`.

## How it works

- `sticky/`: `StickyKind extends QuickConnectKind` (a `TextBoxKind`)
