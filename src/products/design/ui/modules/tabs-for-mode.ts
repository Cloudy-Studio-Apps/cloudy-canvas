import { DEFAULT_MODE } from "@canvas";
import type { LeftTabEntry } from "./design-editor-points.types";

/**
 * The rail rule: the left panel tabs for a mode, in rail order. In the default mode, every tab
 * without `modes`; in any other mode, only the tabs whose `modes` include it, plus the default
 * tabs it keeps (`ModePanelEntry.keepTabs`).
 */
export function tabsForMode(
  tabs: readonly LeftTabEntry[],
  mode: string,
  keep: readonly string[] = [],
): LeftTabEntry[] {
  return tabs
    .filter((tab) =>
      tab.modes ? tab.modes.includes(mode) : mode === DEFAULT_MODE.id || keep.includes(tab.id),
    )
    .sort((a, b) => a.order - b.order);
}
