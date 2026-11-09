import type { FileTab, TabSource } from "./file-tabs.types";

/** How many closed tabs `reopenClosed` remembers (this session only). */
export const CLOSED_TABS_REMEMBERED = 10;

/** The last closed tabs' sources, for `FileTabs.reopenClosed`; only stored files are kept. */
export class ClosedTabs {
  private sources: TabSource[] = [];

  /** Remembers a closed tab, as it was (name, params); a live session can't be joined again. */
  remember(source: TabSource, tab: FileTab): void {
    if (source.live) return;
    const params = { ...tab.params };
    this.sources = [...this.sources, { ...source, name: tab.name, params }].slice(
      -CLOSED_TABS_REMEMBERED,
    );
  }

  /** The last closed tab's source, forgotten here, or `null` when none is remembered. */
  takeLast(): TabSource | null {
    const source = this.sources.at(-1);
    if (!source) return null;
    this.sources = this.sources.slice(0, -1);
    return source;
  }

  clear(): void {
    this.sources = [];
  }
}
