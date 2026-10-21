# Board roadmap

What's still missing for the board to feel like FigJam, roughly ordered by value.

**Already on the board:** stickies, text, drawing (pen, highlighter, smoothing, eraser), connectors, geo shapes, sections, tables, images, embeds, stickers, DB tables and enums, ER diagrams.

**Suggested next:** code block, a small, self-contained element folder that fits an existing base. Mind maps would be the next big feature after it.

## High value

- [ ] **Code block**: a monospace box with a language label and syntax highlighting.
  - A `TextBoxKind` with a `language` field; highlighting drawn as colored text runs.
- [ ] **Lists and checklists** in text and stickies: bullets, numbering, checkboxes you can click.
  - Mostly text layout, plus an `interactionAt` press for the checkbox.
- [ ] **Comments**: a pin with a thread.
  - Kept in the doc but outside the undo history (like `noteHidden`, with `doc.updateUntracked`).
  - Matters most once collaboration arrives; a local version is still useful.

## Medium value

- [ ] **Mind map**: a tree of nodes that lays itself out; Tab adds a child, Enter a sibling.
  - A derived-geometry family through `resolveElements`, like the ER auto-layout (`er/layout/`).
- [ ] **Washi tape**: a decorative translucent strip with patterns.
  - A `LineKind` with a fixed thickness and pattern fills.
- [ ] **More link card providers**: GitHub, Figma, Google Docs, Loom.
  - Extend `fetchLinkPreview` (`shared/core/links/`) and the embed `provider`.
- [ ] **Stickers for agents**: let `create_shapes` stamp stickers from the catalog.
- [ ] **Charts**: a small bar, line or pie chart.
  - Fed from a table element as its data source.
- [ ] **Lasso select**: freeform area selection.
  - A select-tool mode, not a new element.

## Widgets (interactive, for facilitating sessions)

- [ ] **Voting session**: each person gets N dots to place on stickies; the board shows a tally.
  - Builds on stickers.
- [ ] **Timer**: a board-level countdown.
  - Shown in the top bar, not drawn on the canvas.
- [ ] **Poll / counter**: small interactive cards.
  - Same `ctx.activate` action pattern as embeds.

## Productivity features (not elements)

- [ ] **Templates**: retro, kanban, flowchart, user journey.
  - Stored as sections plus stickies, inserted with `insertCopies`.
- [ ] **Tidy up**: arrange the selected stickies in a grid.
- [ ] **Sort and cluster**: sort stickies by color or author; group the selection by color into sections.
- [ ] **Align and distribute** the selection, plus smart guides while dragging.
- [ ] **Locking**: a `locked` flag the select tool respects, so backgrounds and templates can't be moved by accident.
- [ ] **Grouping**: Ctrl+G groups, without sections.
