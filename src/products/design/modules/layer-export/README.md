# Layer export

Figma's Export section: rows saved on a layer, each a size, a name suffix and a file type, which make all their files at once.

- **Tier:** core
- **Requires:** core
- **Contributes:** designEditor: `propertySections`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `set_layer_exports`, `export_layers`
- **Files:** `node-exports.ts` (sizes, default suffixes, new rows), `export-file-name.ts`, `export-nodes.ts` (what the rows make), `layer-export.mcp.ts`, `ui/` (the section, its rows, saving).

## How it works

- **Rows** are `DesignNode.exports` (`NodeExport`, core), edited through the document, so they're undoable, stay in the file and copy with the layer. An edit writes the same list to every selected layer; layers with different lists show a note instead, and "+" replaces them. A suffix still at its size's default follows the size (`withScale`). SVG and PDF hide the size: they're vector.
- **Files:** `plannedExports` names them in layer order (`uniqueFileName`: unsafe characters become `_`, and a taken name numbers the layer's part, `Icon 2@2x.png`, ignoring case as Windows and macOS do). `renderExports` draws them one at a time with `engine.exportElements`: exactly the layer (`padding: 0`, its effects' reach included), transparent for PNG, WebP and SVG.
- **Saving** (`useExportNodes`): one file goes through the save dialog, several through `exportFiles` from `@platform`, into a folder (with `OverwriteDialog`) or a zip, as the section's control says (`useExportDestinationStore`, the last choice; the control is hidden in the browser, which only makes zips).
- Without rows, the section's button opens the export dialog, as it does with nothing selected.
