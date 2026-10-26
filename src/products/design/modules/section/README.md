# Sections

Sections (Shift+S): titled areas on the canvas, in the toolbar's frame menu.

- **Tier:** feature
- **Requires:** frame
- **Contributes:** kinds `SectionKind`; designCanvas: `kinds`, `tools`; designEditor: `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `section.kind.ts`, `section-title.ts`, `section.factory.ts`, `section.defaults.ts`.

## How it works

- **Sections** (`section/`): `SectionKind` (Shift+S, in the toolbar's `frames` menu with Frame): a labeled area (name pill) that holds frames and only goes into sections (`canGoInto`).
