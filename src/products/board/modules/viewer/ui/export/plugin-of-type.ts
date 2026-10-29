import { boardCanvas } from "../../../../board-points";
import { getBoardModules } from "@board/ui";
import { loadedPlugins, type LoadedPlugin } from "@shared/core";

/** The plugin whose module registered an element type, or `undefined` for a built-in one. */
export function pluginOfType(type: string): LoadedPlugin | undefined {
  const module = getBoardModules().ownerOf(boardCanvas.kinds, type);
  return module ? loadedPlugins.ownerOf(module) : undefined;
}
