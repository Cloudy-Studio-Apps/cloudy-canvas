# Layer export

Figma's Export section: rows saved on a layer, each a size, a name suffix and a file type, which make all their files at once.

- **Tier:** core
- **Requires:** core
- **Contributes:** designEditor: `propertySections`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `set_layer_exports`, `export_layers`
- **Files:** `node-exports.ts` (sizes, default suffixes, new rows), `export-file-name.ts`, `export-nodes.ts` (what the rows make), `export-all.ts` (what Export all lists and draws), `layer-export.mcp.ts`, `ui/` (the section, its rows, saving).

## How it works

- **Rows** are `DesignNode.exports` (`NodeExport`, core), edited through the document, so they're undoable, stay in the file and copy with the layer. An edit writes the same list to every selected layer; layers with different lists show a note instead, and "+" replaces them. A suffix still at its size's default follows the size (`withScale`). SVG and PDF hide the size: they're vector.
- **Files:** `plannedExports` names them in layer order (`uniqueFileName`: unsafe characters become `_`, and a taken name numbers the layer's part, `Icon 2@2x.png`, ignoring case as Windows and macOS do). `renderExports` draws them one at a time with `engine.exportElements`: exactly the layer (`padding: 0`, its effects' reach included), transparent for PNG, WebP and SVG. It draws from a copy of the design when the design needs one (`withExportCopy` from `@canvas`: a repeat with rows past its design cap makes every row there), so the file never changes; `drawExports` is the drawing itself.
- **Saving** (`useExportNodes`): one file goes through the save dialog, several through `exportFiles` from `@platform`, into a folder (with `OverwriteDialog`) or a zip, as the section's control says (`useExportDestinationStore`, the last choice; the control is hidden in the browser, which only makes zips).
- **Export all** (`ui/export-all-dialog.tsx`, the main menu's `layerExport.all` command): every visible top-level frame of this page or all pages, plus any visible layer with rows (`exportItems`; the system's hidden page never). A layer's own rows win; the others use the dialog's default row (`plannedExports`' `fallback`), kept for the session in `useExportAllStore`. With all pages each page gets a folder (`folderOf`, `uniqueFolderName`). `renderAcrossPages` draws in a workspace of its own (or its copy, as `renderExports`), so the user's page doesn't change. Saving is `useSaveExports`, shared with the section.
- Without rows, the section's button opens the export dialog, as it does with nothing selected.
