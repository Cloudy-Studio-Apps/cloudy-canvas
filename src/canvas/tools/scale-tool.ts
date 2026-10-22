import type { ResizeMode } from "../handles";
import { SelectTool } from "./select-tool";

/**
 * Figma's Scale tool (K): selects and moves like the select tool, but its handles scale the
 * selection and everything in it (font sizes, stroke weights, radii, children) in proportion.
 */
export class ScaleTool extends SelectTool {
  override readonly id = "scale";
  override readonly resizeMode: ResizeMode = "scale";
}
