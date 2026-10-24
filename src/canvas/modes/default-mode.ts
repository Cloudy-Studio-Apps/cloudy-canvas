import type { CanvasMode } from "./mode.types";

/** The mode every product has: every tool, nothing isolated. */
export const DEFAULT_MODE: CanvasMode = { id: "default", tool: "select" };

/** Whether `tool` works in the mode. */
export function modeAllows(mode: CanvasMode, tool: string): boolean {
  return mode.tools === undefined || tool === mode.tool || mode.tools.includes(tool);
}

/**
 * Whether `command` runs in the mode: any when it doesn't list its commands, else the listed ones,
 * its own keybindings' and the tool switches (`setTool` checks those against `modeAllows`).
 */
export function modeAllowsCommand(mode: CanvasMode, command: string): boolean {
  if (mode.commands === undefined || command.startsWith("tool.")) return true;
  return mode.commands.includes(command) || Object.hasOwn(mode.keybindings ?? {}, command);
}
