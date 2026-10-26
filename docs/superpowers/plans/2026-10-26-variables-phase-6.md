# Variables phase 6: board colors — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Boards get color variables: board elements' colors bind to them, every board color bar offers the document's colors, a small colors manager edits them, colors import from a design (or tokens JSON), one mode per axis for the whole board, and agents get board color tools.

**Architecture:** The token engine (`canvas/tokens/`) is already product-neutral: the board only declares what it binds (`kind.bindable`), runs `syncTokens` with a board `TokenContext` (no per-element modes: each axis's `current`), and adds UI. Color bars bind through tool options: each color option gets a sibling `<option>Token` (the variable id or `null`), which kinds' `restyle`/`optionsOf` and the creating tools read. Shared pieces move down to `canvas/` (agent token args, reading a file's tokens) so the board doesn't import the design.

**Tech Stack:** TypeScript strict, React 19, Yjs, Zustand, Tailwind v4, `@shared/ui/kit`.

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md` (Board — bindable fields; Modes › Board; Extras › Agent tools; Phases › 6).

## Global Constraints

- Verification: `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and scratch check harnesses (no test framework; no tauri dev, cargo, builds or browsers).
- Every type in a sibling `.types.ts`; small single-purpose files; semantic tokens only; radii ≤ 8px, no pills; kit components before raw elements.
- Products can't import each other; engine code (outside `ui/` and `*.module.ts`) is plain TS.
- Board bindable fields, colors only: sticky `color`; geo `fill`, `stroke`; text `color`; stroke `color` (pen only, not highlighter); connector `color`; section `color`; table `color` and cell `fills.<row>.<column>`. Not ER/DB elements.
- Board modes: one pick per mode axis for the whole board (the axis's `current`); no `variableModes` on board elements.
- Leave `CONTEXT.md` and the module-conventions spec alone. No commit (the user commits).

## Review Focus

1. A table row/column inserted, removed or moved: cell bindings follow their cells (not the index).
2. Picking a plain color after a document color unbinds the selection (even when the hex matches).
3. Translucent variables (`#RRGGBB80`) on board fields: stored as `#rrggbbaa`, drawn translucent.
4. Selecting an element loads its bound variable into the bar (`optionsOf`), so the next element made with the tool is bound too.
5. Importing a design keeps only color variables, with the axes and collections they need; aliases to non-color variables are dropped, not left dangling.

---

### Task 1: Shared agent token helpers in `canvas/agent/tokens/`

**Files:** move `products/design/modules/variables/agent/{variable-args,token-ref,describe-variables}.ts` to `src/canvas/agent/tokens/` (+ `index.ts`, exported from `canvas/agent/index.ts`); update the design's imports.

- [ ] Move; error texts that name design tools take a `hint` parameter (default the design's text), so the board's say `list_board_colors`.
- [ ] `pnpm typecheck && pnpm lint` → clean.

### Task 2: Board binding + sync

**Files:** Create `src/products/board/tokens/` (`board-token-context.ts`, `color-field.ts`, `index.ts`, exported from `@board`); modify the sticky, geo, text, stroke, connector, section and table kinds (`bindable`); create `modules/colors/colors.module.ts` (afterEdit → `syncTokens(doc, change, kinds, BOARD_TOKEN_CONTEXT)`), registered in `board-modules.ts`.

- `BOARD_TOKEN_CONTEXT: TokenContext` — `modesOf` → `{}`, `modeDependents(ids)` → a copy of `ids`.
- `colorField(path, label, scopes): BindableField` (`type: "color"`). Scopes: sticky/geo fill/table → `shape-fill`; section → `frame-fill`; text → `text-fill`; geo stroke, stroke, connector → `stroke-color`.
- Table: `color` plus one field per cell, `fills.<r>.<c>`, label `Cell r,c fill`.
- [ ] Check `board-colors.ts` (scratch): bound sticky follows a variable edit; a hand-written color unbinds; a translucent variable stores `#RRGGBBAA`; a table cell path resolves; a highlighter offers no field; switching an axis's current mode recolors.

### Task 3: Table cell bindings follow the grid

**Files:** Create `modules/table/table-cell-bindings.ts` (`moveCellBindings(el, axis, map: (index) => number | null): Record<string, string> | undefined`); `insertLine`, `removeLine`, `moveLine` add `bindings` to their patches.

- [ ] Check (in `board-colors.ts`): insert a row above a bound cell → binding moves down; removing its row drops it; moving its column moves it; other bindings (`color`) untouched.

### Task 4: Tool options carry bound colors

**Files:** Create `products/board/tokens/option-tokens.ts`; add `<option>Token: string | null` (default `null`) to the sticky, geo (`shapeFillToken`, `shapeStrokeToken`), section, table, connector and draw (`markerColorToken`) options and their module defaults; kinds' `restyle`/`optionsOf`; the six creating sites (sticky tool, shape tool, section tool, table tool, marker tool (pen only), connector drag).

- `restyleColor(el, options, option, path): patch` — only when `options[option]` is in the patch: writes the color, and `bindings[path]` = `options[option + "Token"]` or removes it.
- `optionToken(el, path): string | null` for `optionsOf`; `newBindings(options, { path: option }): { bindings? }` for creation.
- [ ] Check: restyle with a token binds; with `null` unbinds even at the same hex; optionsOf returns the token; a new sticky from options is bound.

### Task 5: Document colors in every board color bar

**Files:** Create `products/board/ui/components/board-colors/` (`board-color-palette.tsx`, `document-colors-button.tsx`, `use-board-color.ts`, types, index); `VariablePicker` gets an optional `footer`; `ColorPalette` gets `noneSelected`; replace the bars in sticky, shape (fill, outline), section, connector, table header, draw (marker only) and table cell fills (binds `fills.r.c` of the selected cells, one undo step).

- `useBoardColor(option)` → `{ value, token, pickColor(hex), pickToken(id) }`: `pickToken` resolves the variable on the board and sets `{ [option]: hex, [option+"Token"]: id }`.
- The button shows the bound variable's swatch (selected) or a palette glyph, opens `VariablePicker` (type color, the field's scopes, footer "Manage colors…").
- [ ] lint/typecheck/format.

### Task 6: Colors manager

**Files:** `modules/colors/ui/` (`board-colors-panel.tsx`, `colors-button.tsx`, `color-row.tsx`, `color-value-popover.tsx`, `board-modes.tsx`, `delete-color-dialog.tsx`, types, index); `colorsOpen` in `board-panel-store` (exclusive with schema/ER); contributed as a `sidePanels` entry and a `topBar` button, plus host command `openBoardColors`.

- Collections → group accordions → rows: swatch (edit the current mode's value with `ColorPicker`, a drag one undo step), name (commit field; slash paths group), alias to another color / remove alias, delete (asks with the usage count when used). "+ Color" (makes a "Colors" collection when there's none), group rename. Mode switches for axes with two or more modes (`setCurrentMode`).
- [ ] lint/typecheck/format.

### Task 7: Import colors from a file, export

**Files:** Create `canvas/tokens/exchange/read-file-tokens.ts` (`readFileTokens(bytes): TokenRecord[] | null` — any canvas file container, migrated; the design's `readDesignTokens` uses it) and `color-tokens.ts` (`colorTokensOnly(records)`: color variables, the collections and axes they use, aliases to non-colors dropped); `products/board/tokens/read-color-source.ts` (`.cdesign`/`.cboard`, else DTCG or Tokens Studio JSON, no style codecs); `pickTokenFile(options?)` takes a title and extensions; `modules/colors/ui/import-colors-dialog.tsx` (collections to tick, conflict choice, warnings) and the panel's Import / Export (DTCG, CSS) menu.

- [ ] Check: a design's records with a number variable and an alias to it → only colors left, the alias's variable dropped; plan + import lands one undo step; DTCG round trip of board colors.

### Task 8: Board color agent tools

**Files:** `modules/colors/agent/` — `list_board_colors`, `create_board_colors`, `update_board_colors`, `delete_board_colors`, `bind_board_colors` (`[{ id, field?, color }]`; `field` defaults to the shape's first color field), `unbind_board_colors`, `set_board_color_mode`, `import_board_colors` (`path` | `text`, `collections`, `conflict`, `preview`), `export_board_colors` (`dtcg` | `css`, `path?`); `get_shapes`/`list_shapes` summaries carry `colors` (field → `Collection/name`); a line in the board's agent instructions.

- [ ] lint/typecheck/format; live MCP test after the user reconnects.

### Task 9: Docs

- [ ] CLAUDE.md: Variables bullet "phases 1, 2, 4, 5 and 6" plus a board colors paragraph; "Not yet" lists only expressions.
