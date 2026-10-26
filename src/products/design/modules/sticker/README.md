# Stickers

Stickers on designs (Shift+K): the foca watona seals, stamps and emojis, with an edge and outline, convertible to vectors.

- **Tier:** feature
- **Requires:** core, group, vector
- **Contributes:** kinds `StickerNodeKind`; designCanvas: `hostCommands`, `kinds`, `options`, `pasteForeign`, `tools`; designEditor: `contextMenu`, `layerIcons`, `propertySections`, `sessionHooks`, `toolPanels`, `tools`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `convert_stickers_to_vectors`, `restyle_design_stickers`, `stamp_design_stickers`
- **Files:** `sticker.kind.ts`, `sticker.tool.ts`, `sticker-outline.ts`, `sticker-edge.ts`, `sticker-to-vectors.ts`, `sticker-paste.ts`, `sticker.mcp.ts`, `ui/`.

## How it works

- **Stickers** (`sticker/`): `StickerNodeKind` (`type: "sticker"`, a `DesignNodeKind`: `sticker`, `label`, `assetId`, `edgeColor`, `outline`) draws its picture as a `fit` image paint over its box (no fills or strokes of its own, `keepsRatio`, `mirrorsOnFlip`); its `outline` (`StickerOutline`: color, width, visible) is drawn by the kind's `ownEffects` (a `DesignNodeKind` hook merged before the node's effects by `nodeEffects`, which `hasEffects`/`hasScope` and `designEffects` read): a drop shadow with no offset or blur spread by the width, so it follows the picture's alpha (`stickerOutlineEffects`). Edge color (`stickerEdgePatches`, `canRestyleEdge`: stickers whose def has `restyle`) stores the restyled picture under its own asset id. `DesignStickerTool` (Shift+K; K is Scale) stamps into the frame under the pointer (`parentFor`). **Convert to vectors** (`stickerToVectors`, the `stickerToVectors` host command, `useStickerCommands`, the Sticker section's button and the context menu; `canConvertSticker` only reads the asset's start): the asset's SVG is read with `readSvg` (`canvas/svg/`: path data with arcs and packed flags, the basic shapes, transforms, inherited styles, linear and radial gradients by `href`, a die-cut edge filter `SvgEdgeFilter`; text, images and uses skipped) and becomes a group with the sticker's id: one vector per layer (fill areas normalized, strokes as `openNetwork` chains, gradients through `svgPaint`/`transformFromHandles`), an "Edge" vector under them (the edged art's union grown by the edge with `outlineStroke`) and the shadow and outline as the group's drop shadows. The Sticker section (`ui/sticker-section.tsx`: Edge, Outline fields, Convert to vectors), agents' `stamp_design_stickers`, `restyle_design_stickers` and `convert_stickers_to_vectors` (`sticker.mcp.ts`; `update_nodes` takes `outline` only, `readStickerOutline`).
