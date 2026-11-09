# Shared tool specs

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

- **What's here:** the part of a tool boards and designs serve under one name (`SharedToolSpec`: local
  `name`, `description`, `inputSchema`), one constant per tool, grouped by topic (`file.specs.ts`,
  `selection.specs.ts`, `history.specs.ts`, `view.specs.ts`, `clipboard.specs.ts`,
  `sticker.specs.ts`). Each product's tool spreads the constant and adds its `run`
  (`{ ...FILE_GET_TOOL, run }`), so the two `inputSchema`s are the same object and the server's
  `sameSchema` check holds.
- **Descriptions** are written once for both: they say "elements", "the open file", "the board, or
  the page you work on in a design", and name what only one product returns or takes.
- **Union of arguments:** an argument only one product honors stays in the schema, its description
  starting "Boards only." or "Designs only.", and the other product ignores it (`sticker_stamp`'s
  `edgeColor`, `outline` and `parent`).
- The 3D model tools' specs are next to their pieces in `canvas/model3d/mcp/`; the `arrange` and
  `style` tools are whole factories in `canvas/mcp/` (`arrangeTools`, `copyPropertiesTool`).
