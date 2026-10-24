// Stickers on a design: a node showing a picked sticker's picture, with its edge color and an
// outline, the sticker tool (Shift+K) and turning one into vectors. The catalog and the picker
// are shared with the board (`@shared/core` stickers, `@canvas-ui` StickerWheel).
export type * from "./sticker.types";
export type { StickerToolOptions } from "@shared/core";
export { createStickerNode, stickerRect } from "./sticker.factory";
export { STICKER_NODE_DEFAULTS } from "./sticker.defaults";
export { StickerNodeKind } from "./sticker.kind";
export { DesignStickerTool } from "./sticker.tool";
export { canRestyleEdge, stickerEdgePatches } from "./sticker-edge";
export { readEdgeColor, readStickerOutline } from "./sticker-args";
export {
  canConvertSticker,
  stickerSvg as stickerSvgLayers,
  stickerToVectors,
} from "./sticker-to-vectors";
