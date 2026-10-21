// Framework-agnostic canvas engine: PixiJS renders, a Yjs doc (BoardDocument) holds the content.
// React only hosts it (mount/unmount) and draws UI around it; never import React or UI code here.
export type { CanvasEngineOptions, HostActions } from "./canvas-engine.types";
export type { AgentBoard, AgentHost, AgentTool, ElementSummary, ToolArgs } from "./agent";
export type { CommandId } from "./commands.types";
export type { EngineState } from "./engine-state.types";
export type { CanvasTheme } from "./render";
export type { ToolId, ToolOptions } from "./tools";
export type {
  AnyElement,
  CanvasElement,
  ElementType,
  GeoElement,
  GeoVariantId,
  StickyElement,
  StrokeElement,
} from "./elements";
export { CanvasEngine } from "./canvas-engine";
export { AGENT_INSTRUCTIONS, createAgentTools } from "./agent";
export { KEYMAP, shortcutLabel } from "./input";
export { TOOL_IDS } from "./tools";
export { GEO_VARIANT_IDS, GEO_VARIANTS } from "./elements";
export {
  BoardDocument,
  SHAPE_FILLS,
  SHAPE_STROKES,
  MARKER_COLORS,
  MARKER_SIZES,
  STICKY_COLORS,
} from "./document";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
