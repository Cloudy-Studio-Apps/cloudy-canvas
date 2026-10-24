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
export type {
  AfterEdit,
  DocumentActor,
  DocumentChange,
  DocumentMeta,
  DocumentMetaPatch,
  EditedChange,
  HistoryChange,
  Placement,
  UndoHistory,
} from "./document";
export type * from "./workspace";
export type { EngineLoading } from "./engine-loading.types";
export type { EngineState } from "./engine-state.types";
export type {
  ExportArea,
  ExportBackground,
  ExportFormat,
  ExportOptions,
  PdfImage,
  PdfOptions,
  PdfPage,
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
  ElementMask,
  ElementMasks,
  MaskMode,
  MaskShape,
  MaskSlot,
  EffectSlot,
  ScopeSlot,
  EffectScope,
  ScopeComposite,
  ElementEffects,
  EffectPass,
  EffectRenderer,
  EffectRenderers,
  EffectStage,
  EffectUniforms,
  ImageFit,
  ImagePaintLayer,
  ImageQuality,
  PaintLayer,
  PaintStackOptions,
  PaintTools,
  ShapePaintLayer,
} from "./render";
export type { CanvasPointer, Tool, ToolContext } from "./tools";
export type { SnapAxis, SnapFeedback, SnapGap, SnapLine, Snapper, SnapSettings } from "./snapping";
export {
  anchorPoint,
  nudgeCheckpoint,
  nudgeStep,
  NUDGE_STEPS,
  readingOrder,
  SCALE_ANCHORS,
} from "./arrange";
export { CanvasEngine } from "./canvas-engine";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
export { DEFAULT_VIEW_OPTIONS } from "./canvas-view";
export { cloneElements, imageSize } from "./clipboard";
export {
  actorDocument,
  CanvasDocument,
  changesOnly,
  compareByIndex,
  DocumentFeed,
  GEOMETRY_FIELDS,
  DocumentHistory,
  LOCAL_ORIGIN,
  ReadOnlyDocumentError,
} from "./document";
export { ActorWorkspace, followEdit, showArea, withAspect } from "./workspace";
export { HOST_ORIGIN, ShareGuest, ShareHost } from "./share";
export type * from "./share";
export { decodeCanvasFile, encodeCanvasFile } from "./file";
export { canvasBlob, encodePdfPages } from "./export";
export * from "./agent";
export * from "./elements";
export * from "./geometry";
export * from "./modes";
export * from "./gradient";
export * from "./image";
export * from "./rotation";
export * from "./path";
export { smoothPoints } from "./smooth-points";
export { BASE_COMMAND_LABELS, BASE_KEYBINDINGS, Keymap } from "./input";
export { composeProduct, createCanvasPoints } from "./modules";
export {
  atopShader,
  EffectShader,
  effectsOutset,
  ElementView,
  FILTER_HEADER,
  SAMPLING_GLSL,
  shapeUnderShader,
  silhouetteShader,
  underShader,
} from "./render";
export type * from "./effects";
export { BLEND_MODES, isBlendMode } from "./effects";
export { defineService } from "./services";
export type {
  FontStyle,
  FontWeight,
  RichFragment,
  RichLine,
  RichSpan,
  RichTextFrame,
  RichTextLayout,
  TextAlign,
  TextDecoration,
  TextFont,
  TextFontOptions,
  TextRun,
  TextSelection,
} from "./text";
export {
  centerTextTop,
  clearRunFields,
  cssFont,
  decorationRect,
  fontFamilyList,
  fontsVersion,
  fragmentOffsets,
  layoutRichText,
  measureText,
  measureTextBlock,
  measureWrapped,
  normalizeRuns,
  richTextInk,
  runsForText,
  runStyleAt,
  sameRunStyle,
  spliceRuns,
  styleRuns,
  textFont,
} from "./text";
export {
  createBaseTools,
  DRAW_THRESHOLD_PX,
  FreehandTool,
  MOVE_THRESHOLD_PX,
  pastThreshold,
  SelectTool,
  selectAndEdit,
} from "./tools";
export {
  bytesToBase64,
  clamp,
  debounce,
  Emitter,
  identityKey,
  LruCache,
  prefersReducedMotion,
  Registry,
} from "./utils";
