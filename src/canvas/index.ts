// The canvas engine shared by every product: PixiJS renders, a Yjs doc (CanvasDocument) holds the
// content. A product (board, design, …) brings its element kinds, tools and keymap as a
// `CanvasProduct`. React only hosts it (mount/unmount) and draws UI around it; never import React,
// UI or product code here.
export type {
  CanvasEngineOptions,
  ContextMenuRequest,
  ElementAction,
  GuideDragHandle,
  HostAction,
} from "./canvas-engine.types";
export type { Alignment, DistributeAxis, RotatePivot, ScaleAnchor } from "./arrange";
export type { CanvasProduct, CanvasScopes, SelectTargetRequest } from "./canvas-product.types";
export type { CanvasGrid, CanvasViewOptions } from "./canvas-view.types";
export type { CopyContext, DropResult, PastedImage } from "./clipboard";
export type { CommandHandler, Commands } from "./commands.types";
export type { DocumentChange, DocumentMeta, DocumentMetaPatch } from "./document";
export type { EngineLoading } from "./engine-loading.types";
export type { EngineState } from "./engine-state.types";
export type {
  ExportArea,
  ExportBackground,
  ExportFormat,
  ExportOptions,
  ThumbnailOptions,
} from "./export";
export type { Point, Rect, Size } from "./geometry.types";
export type { ResizeMode } from "./handles";
export type { Keybindings } from "./input";
export type * from "./modules";
export type { CanvasGuides, RulerGuide } from "./ruler-guides";
export { overRuler, RULER_SIZE } from "./ruler-guides";
export type { ServiceDef } from "./services";
export type { CanvasLinks, Guide, GuideView, LinkView } from "./links";
export type {
  CanvasTextOptions,
  CanvasTheme,
  ElementClip,
  ImageFit,
  ImagePaintLayer,
  PaintLayer,
  PaintStackOptions,
  ShapePaintLayer,
} from "./render";
export type { CanvasPointer, Tool, ToolContext } from "./tools";
export type { SnapAxis, SnapFeedback, SnapGap, SnapLine, Snapper, SnapSettings } from "./snapping";
export { anchorPoint, nudgeCheckpoint, nudgeStep, NUDGE_STEPS, SCALE_ANCHORS } from "./arrange";
export { CanvasEngine } from "./canvas-engine";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
export { DEFAULT_VIEW_OPTIONS } from "./canvas-view";
export { cloneElements, imageSize } from "./clipboard";
export { CanvasDocument, DocumentFeed, LOCAL_ORIGIN } from "./document";
export { decodeCanvasFile, encodeCanvasFile } from "./file";
export * from "./agent";
export * from "./elements";
export * from "./geometry";
export * from "./rotation";
export { smoothPoints } from "./smooth-points";
export { BASE_COMMAND_LABELS, BASE_KEYBINDINGS, Keymap } from "./input";
export { composeProduct, createCanvasPoints } from "./modules";
export { ElementView } from "./render";
export { defineService } from "./services";
export type { FontStyle, FontWeight, TextAlign, TextFont, TextFontOptions } from "./text";
export {
  centerTextTop,
  cssFont,
  fontFamilyList,
  measureText,
  measureTextBlock,
  measureWrapped,
  textFont,
} from "./text";
export {
  createBaseTools,
  DRAW_THRESHOLD_PX,
  FreehandTool,
  MOVE_THRESHOLD_PX,
  pastThreshold,
  selectAndEdit,
} from "./tools";
export { bytesToBase64, clamp, debounce, Emitter, Registry } from "./utils";
