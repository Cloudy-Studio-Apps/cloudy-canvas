# Sections

Sections (Shift+S): titled areas that take what's inside along when they move, with the top bar's Sections menu.

- **Tier:** feature
- **Requires:** —; uses: sticky
- **Contributes:** kinds `SectionKind`; boardCanvas: `alignTarget`, `frames`, `kinds`, `options`, `tools`, `withMembers`; boardEditor: `selectionPanels`, `toolPanels`, `tools`, `topBar`; `boardStarters` (Retrospective: Went well, To improve and Actions sections with a sticky each, `ui/starters/`)
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `section.viewer.ts` (the module the HTML viewer loads instead), `section.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `section.kind.ts`, `section.tool.ts`, `section-members.ts`, `board-sections.ts`, `ui/`.

## How it works

- `section/`: `SectionKind extends TextBoxKind`, a frame (`frame = true`) with its title edited in place in the strip along its top edge. It's hit by its title or border only, so clicks inside reach its contents. Membership is geometric: the elements fully inside it move and delete with it (`withSectionMembers`, part of the board's `withMembers`), so nothing stores parent links. The top bar's Sections menu (`ui/sections-menu/`) zooms to one.
