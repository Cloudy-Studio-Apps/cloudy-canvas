# temporal/

Code moved out of `src/` while the board is rebuilt on the element architecture (see "Elements" in
`CLAUDE.md`). Nothing here is compiled, linted or formatted. Paths mirror `src/`.

- Features waiting to be ported: text and connectors (DB tables/enums and DBML are back
  in `src/products/board/elements/db/`, ER diagrams in `src/products/board/elements/er/`). That covers their engine modules, tools, layers, agent tools and React panels.
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

## Architecture notes for the features in here (from CLAUDE.md before the rebuild)

Paths are relative to the old `src/engine/`. "Shape" is the old name for an element.

- **Shapes and connectors** (`shape` and `connector` tools). `geo` shapes (`geo/` outlines) have fill, stroke and centered text that's edited with the `TextEditor`. A `connector`'s ends are free points or attached to a shape (`shapeId` plus an optional side).
  - `Scene.refresh()` replaces each connector with a copy resolved by `connectors/resolve-connector.ts` (route, bounds, `points`). So **read shapes for geometry from the scene** (`scene.get`, `ctx.getShape`), not `doc.get`; the stored connector bounds are stale.
  - When shapes change, the engine also redraws the connectors attached to them (`scene.connectorsAttachedTo`). Deleting goes through `remove-shapes.ts`, which frees the attached connector ends and prunes DB refs.
  - Presses on handles (connector ends, resize, quick-connect dots, table columns) are resolved by `find-interaction.ts` before normal selection. The handle geometry lives in `handles/`.
