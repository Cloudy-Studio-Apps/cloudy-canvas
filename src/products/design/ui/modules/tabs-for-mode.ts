import { DEFAULT_MODE } from "@canvas";
import type { LeftTabEntry } from "./design-editor-points.types";

/** The left panel tabs for a mode (`LeftTabEntry.modes`), in rail order. */
export function tabsForMode(tabs: readonly LeftTabEntry[], mode: string): LeftTabEntry[] {
  return tabs
    .filter((tab) => (tab.modes ?? [DEFAULT_MODE.id]).includes(mode))
    .sort((a, b) => a.order - b.order);
}
