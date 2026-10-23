import type { CanvasMode } from "./mode.types";

/** The mode every product has: every tool, nothing isolated. */
export const DEFAULT_MODE: CanvasMode = { id: "default", tool: "select" };

/** Whether `tool` works in the mode. */
export function modeAllows(mode: CanvasMode, tool: string): boolean {
  return mode.tools === undefined || tool === mode.tool || mode.tools.includes(tool);
}
