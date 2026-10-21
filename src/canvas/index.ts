// The canvas engine shared by every product: PixiJS renders, a Yjs doc (CanvasDocument) holds the
// content. A product (board, design, …) brings its element kinds, tools and keymap as a
// `CanvasProduct`. React only hosts it (mount/unmount) and draws UI around it; never import React,
// UI or product code here.
export type { CanvasEngineOptions, ElementAction, HostAction } from "./canvas-engine.types";
export type { CanvasProduct } from "./canvas-product.types";
export type { CopyContext, PastedImage } from "./clipboard";
export type { CommandHandler, Commands } from "./commands.types";
export type { DocumentChange } from "./document";
export type { EngineState } from "./engine-state.types";
export type { Point, Rect, Size } from "./geometry.types";
export type { Keybindings } from "./input";
export type { CanvasLinks, Guide, GuideView, LinkView } from "./links";
export type { CanvasTextOptions, CanvasTheme, ImageFit } from "./render";
export type { CanvasPointer, Tool, ToolContext } from "./tools";
export { CanvasEngine } from "./canvas-engine";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
export { CanvasDocument, DocumentFeed, LOCAL_ORIGIN } from "./document";
export * from "./agent";
export * from "./elements";
export * from "./geometry";
export { BASE_COMMAND_LABELS, BASE_KEYBINDINGS, Keymap } from "./input";
export { ElementView } from "./render";
export { centerTextTop, measureText, measureWrapped } from "./text";
export { createBaseTools, selectAndEdit } from "./tools";
export { Emitter, Registry } from "./utils";
