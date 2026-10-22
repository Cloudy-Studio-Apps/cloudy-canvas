import { inLibrary, toolInfo, type ToolEntry } from "@canvas-ui";
import type { BoardEngine } from "@board";
import { LIBRARY_TOOLS_SECTION } from "./library-catalog";
import type { LibraryItem } from "./library.types";

/** Tools without a toolbar position (or an order of their own) come after the others. */
const UNPLACED_ORDER = 1_000_000;

/**
 * The library cards of the tools: every tool that creates an element (unless it opts out) and
 * any other tool with a `library` placement. Picking one switches to the tool.
 */
export function toolLibraryItems(
  entries: readonly ToolEntry[],
  engine: BoardEngine,
): LibraryItem[] {
  return entries.filter(inLibrary).map((entry) => {
    const placement = entry.library || {};
    const { label, description } = toolInfo(entry, engine);
    return {
      id: `tool.${entry.tool}`,
      section: placement.section ?? LIBRARY_TOOLS_SECTION,
      order:
        placement.order ??
        (entry.toolbar ? entry.toolbar.group * 1000 + entry.toolbar.order : UNPLACED_ORDER),
      label,
      ...(description ? { description } : {}),
      icon: entry.icon,
      ...(placement.keywords ? { keywords: placement.keywords } : {}),
      run: (target) => target.setTool(entry.tool),
    };
  });
}
