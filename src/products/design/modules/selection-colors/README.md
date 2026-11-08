# Selection colors

Figma's "Selection colors": the properties panel lists every color the selected layers and
everything inside them paint with, and changing one changes it everywhere it's used, so a frame,
a group or a vector with many colors is recolored without going into each layer.

- **Tier:** feature
- **Requires:** core, text
- **Contributes:** designEditor: `propertySections` (`selection-colors`, after Strokes)
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `collect-selection-colors.ts`, `node-color-paths.ts`, `paint-color-paths.ts`,
  `recolor-patches.ts`, `ui/` (the section, its rows and its `when`, `hasSelectionColors`).

## How it works

`collectSelectionColors(nodes, elements)` walks the selection and its descendants
(`withDescendants`) in page order and reads each node's color paths (`nodeColorPaths`): the
visible solid paints and gradient stops of every paint stack (`nodePaintStacks`: fills, strokes,
vectors' areas' own fills) plus texts' ranges' fills (`runs.<i>.style.fills`). Paths bound to a
variable or a style (the path or a parent of it in `bindings`) are left out: they follow their
variable or style. Uses with the same hex and opacity (to the percent) are one `SelectionColor`
with all their `refs` (`{ nodeId, path }`).

The section shows when the selection paints with two colors or more, or with one color on several
layers. Each row is a `ColorField` (hex and opacity) and a button selecting the layers that use the
color. A change writes the color and opacity at every ref (`recolorPatches`, through
`setPathsPatch`) in one `updateMany`; a drag is one undo step (the field holds the checkpoints).
While a drag goes on the list is held as it was, so the dragged row (and its open picker) stays
put even when its color meets another. The first eight colors show, "See all" the rest.

## Not yet

Image paints, effect colors (shadows) and colors bound to variables or styles aren't listed.
