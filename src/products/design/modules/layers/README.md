# Layers

The Layers tab: the page's layer tree (select, rename, hide, lock, drag to rearrange), searchable, with the sections other modules add under it (the pages).

- **Tier:** core
- **Requires:** core
- **Contributes:** designEditor: `leftTabs`; `designMcpTools`
- **Points it owns:** `layersTabSections` (`ui/layers.points.ts`): sections under the layer tree; pages adds its list
- **MCP tools:** `layers_tree_get`, `layers_move`
- **Files:** `layers.module.ts`, `layer-tree-of.ts` (the tree for agents), `mcp/` (`layers_tree_get`, `layers_move`), `ui/` (the tab, rows, drag, `layers.points.ts`; a row shows the `designEditor.layerBadges` modules give after its name, `LayerBadges`).

## How it works

The Layers tab: the page's layer tree (select, rename, hide, lock), and the tree for agents (`layers_tree_get`).
