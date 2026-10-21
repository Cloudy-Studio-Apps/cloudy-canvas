# temporal/

Code moved out of `src/` while the board is rebuilt on the element architecture (see "Elements" in
`CLAUDE.md`). Nothing here is compiled, linted or formatted. Paths mirror `src/`.

- Every feature has been ported back (sections, text, connectors, DB tables/enums and DBML, ER
  diagrams).
- Reference copies of core files from before the rebuild: `shapes.types.ts`, `canvas-engine.ts`,
  `scene.ts`, `hit-test.ts`, the old drawers and so on.

Port a feature into the board product, then delete what it replaced from here: its element type
into `src/products/board/elements/<type>/`, its tool into `products/board/tools/`, its agent tools
into `products/board/agent/` and its panels into `products/board/ui/`. Shared engine pieces go into
`src/canvas/` only if every product can use them.

`src/` was reorganized after these files were parked, so their paths (`src/engine/…`,
`src/pages/editor/board/…`, `src/core/…`) are the old layout. Where things live now:

| Old | Now |
| --- | --- |
| `src/engine/` (generic parts) | `src/canvas/` |
| `src/engine/elements/<type>/`, board tools, palette, agent tools | `src/products/board/` |
| `src/pages/editor/board/` | `src/products/board/ui/` (generic chrome in `src/canvas-ui/`) |
| `src/core/`, `src/ui/`, `src/stores/` | `src/shared/core/`, `src/shared/ui/`, `src/shared/stores/` |
| `BoardDocument` | `CanvasDocument` (`src/canvas/document/`) |
