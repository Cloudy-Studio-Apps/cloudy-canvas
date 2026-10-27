# Canvas points

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Canvas points

- **Canvas points** (`canvas/modules/`, `createCanvasPoints<O>(product)`, the board's `boardCanvas`): `kinds`, `tools` (`{ id, create(ctx), keys }`), `hostCommands` (`{ id, label, keys }`), `keybindings`, `options` (defaults of the options a module owns; given twice throws), `scopes`, `guides`, `clips`, `masks`, `effects`, `undrawn`, `rulerFrame` and `frames` (one module each), `effectRenderers` (keyed by type), `links`, `resolveElements`, `withMembers`, `alignTarget` (one module), `rootOf` (one module), `onRemove`, `prepareCopies`, `pasteText`, `pasteOnto`, `pasteImage`. `composeProduct(id, host, points)` turns them into a plain `CanvasProduct`: keybindings over `BASE_KEYBINDINGS` (a command bound twice throws), hooks chained in module order, the first paste that returns an element wins. So the order of modules matters: `text` is `after: ["embed"]` so a pasted link is a card before it's text, `er` is `after: ["section"]` (a section takes its contents, then ER elements their attributes) and `connector` is `after: ["er"]` (connectors are routed once ER boxes are placed). `sticky` and `geo` `requires: ["connector"]` for their quick-connect dots, and `db` requires `sticky` (DBML notes).
