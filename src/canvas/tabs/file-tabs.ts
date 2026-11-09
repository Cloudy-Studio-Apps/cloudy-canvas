import type { FileInfo } from "@shared/core";
import type { CanvasDocument } from "../document";
import { Store } from "../utils";
import type {
  FileTab,
  FileTabsOptions,
  FileTabsSnapshot,
  OpenTabOptions,
  TabSource,
  TabState,
} from "./file-tabs.types";
import { createTab, moveTab, patchTab, tabFileId } from "./tab-list";

/** How many closed tabs `reopenClosed` remembers (this session only). */
export const CLOSED_TABS_REMEMBERED = 10;

/**
 * The open file tabs and the document each one owns (see the README). Plain data in a `Store`,
 * read in React with `useSyncExternalStore`; every change publishes a new snapshot.
 */
export class FileTabs {
  readonly store = new Store<FileTabsSnapshot>({ tabs: [], activeId: null });

  private readonly options: FileTabsOptions;
  private readonly now: () => number;
  /** Each tab's source, for its loader and for reopening it. */
  private readonly sources = new Map<string, TabSource>();
  /** Loads in flight; a tab hibernated or closed meanwhile drops its entry, and the load its document. */
  private readonly loads = new Map<string, Promise<CanvasDocument>>();
  private closed: TabSource[] = [];
  private disposed = false;

  constructor(options: FileTabsOptions) {
    this.options = options;
    this.now = options.now ?? Date.now;
  }

  open(source: TabSource, options: OpenTabOptions = {}): FileTab {
    const activate = options.activate ?? true;
    const existing = this.byFileId(tabFileId(source));
    if (existing) {
      if (activate) this.activate(existing.id);
      return this.get(existing.id) ?? existing;
    }
    this.makeRoom();
    const tab = createTab(source, this.now());
    this.sources.set(tab.id, source);
    this.publish({ tabs: [...this.tabs, tab] });
    if (activate) this.activate(tab.id);
    return this.get(tab.id) ?? tab;
  }

  /** Shows the tab `id` (`null`: Home); the tab left stays `headless`. */
  activate(id: string | null): void {
    const { activeId } = this.store.get();
    if (id === activeId || (id !== null && !this.get(id))) return;
    const now = this.now();
    let tabs = this.tabs;
    if (activeId) tabs = patchTab(tabs, activeId, () => ({ state: "headless", lastActiveAt: now }));
    if (id) tabs = patchTab(tabs, id, () => ({ state: "active", lastActiveAt: now }));
    this.publish({ tabs, activeId: id });
    if (id) this.loadQuietly(id);
  }

  /** Closes the tab, destroying its document; the active one hands over to a neighbor. */
  close(id: string): void {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    const tab = this.tabs[index];
    if (!tab) return;
    if (this.store.get().activeId === id) {
      const neighbor = this.tabs[index + 1] ?? this.tabs[index - 1] ?? null;
      this.activate(neighbor?.id ?? null);
    }
    const source = this.sources.get(id);
    this.unload(tab);
    tab.live?.leave();
    this.sources.delete(id);
    this.publish({ tabs: this.tabs.filter((other) => other.id !== id) });
    // A live session can't be joined again from here: only stored files are remembered.
    if (source && !source.live) {
      const params = { ...tab.params };
      this.closed = [...this.closed, { ...source, name: tab.name, params }].slice(
        -CLOSED_TABS_REMEMBERED,
      );
    }
  }

  /** Opens the last closed tab again, or `null` when none is remembered. */
  reopenClosed(): FileTab | null {
    const source = this.closed.at(-1);
    if (!source) return null;
    this.closed = this.closed.slice(0, -1);
    return this.open(source);
  }

  move(id: string, index: number): void {
    this.publish({ tabs: moveTab(this.tabs, id, index) });
  }

  get(id: string): FileTab | undefined {
    return this.tabs.find((tab) => tab.id === id);
  }

  byFileId(fileId: string): FileTab | undefined {
    return this.tabs.find((tab) => tab.fileId === fileId);
  }

  patch(
    id: string,
    patch: Partial<Pick<FileTab, "name" | "unsaved" | "hosting" | "params">>,
  ): void {
    this.publish({ tabs: patchTab(this.tabs, id, () => patch) });
  }

  /**
   * The file a loaded tab's document is now saved in (its first save, Save as, a draft becoming a
   * file), so an editor mounted on it again doesn't take it for a new file.
   */
  setInfo(id: string, info: FileInfo): void {
    const tab = this.get(id);
    if (tab?.load.status !== "ready" || tab.load.info === info) return;
    const load = { ...tab.load, info };
    this.publish({ tabs: patchTab(this.tabs, id, () => ({ load })) });
  }

  /**
   * Moves a background tab between memory states (`activate` owns `active`). `hibernated`
   * destroys its document; the others load it when it isn't in memory.
   */
  setState(id: string, state: TabState): void {
    const tab = this.get(id);
    if (!tab || tab.state === state) return;
    if (state === "active" || this.store.get().activeId === id)
      throw new Error("FileTabs.setState: the active tab changes only through activate()");
    if (state === "hibernated") this.unload(tab);
    this.publish({ tabs: patchTab(this.tabs, id, () => ({ state })) });
    if (state !== "hibernated") this.loadQuietly(id);
  }

  /** The tab's document, loading it once; concurrent calls share one load. */
  ensureLoaded(id: string): Promise<CanvasDocument> {
    const tab = this.get(id);
    const source = this.sources.get(id);
    if (!tab || !source) return Promise.reject(new Error(`No file tab ${id}`));
    if (tab.load.status === "ready") return Promise.resolve(tab.load.document);
    const pending = this.loads.get(id);
    if (pending) return pending;
    const load = this.options.loaders[tab.type]
      .load(source.fileId, tab.live)
      .then(({ document, info }) => {
        if (this.loads.get(id) !== load) {
          document.destroy();
          throw new Error(`File tab ${id} was closed or hibernated while loading`);
        }
        this.loads.delete(id);
        const name = info?.name ?? this.get(id)?.name ?? "";
        this.publish({
          tabs: patchTab(this.tabs, id, () => ({
            name,
            load: { status: "ready", document, info },
          })),
        });
        return document;
      })
      .catch((error: unknown) => {
        if (this.loads.get(id) === load) {
          this.loads.delete(id);
          const message = error instanceof Error ? error.message : String(error);
          this.publish({
            tabs: patchTab(this.tabs, id, () => ({ load: { status: "error", message } })),
          });
        }
        throw error;
      });
    this.loads.set(id, load);
    this.publish({ tabs: patchTab(this.tabs, id, () => ({ load: { status: "loading" } })) });
    return load;
  }

  /** Binds an agent session to the tab, moving it out of the tab it was in. */
  bindAgent(id: string, session: string): void {
    if (!this.get(id)) return;
    this.unbindAgent(session);
    this.publish({
      tabs: patchTab(this.tabs, id, (tab) => ({ agents: [...tab.agents, session] })),
    });
  }

  unbindAgent(session: string): void {
    const tab = this.tabs.find((other) => other.agents.includes(session));
    if (!tab) return;
    const agents = tab.agents.filter((other) => other !== session);
    this.publish({ tabs: patchTab(this.tabs, tab.id, () => ({ agents })) });
  }

  noteAgentCall(id: string): void {
    const now = this.now();
    this.publish({ tabs: patchTab(this.tabs, id, () => ({ lastAgentCallAt: now })) });
  }

  /** Destroys every tab's document and leaves their live sessions. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const tab of this.tabs) {
      this.unload(tab);
      tab.live?.leave();
    }
    this.sources.clear();
    this.closed = [];
    this.store.set({ tabs: [], activeId: null });
    this.store.destroy();
  }

  private get tabs(): readonly FileTab[] {
    return this.store.get().tabs;
  }

  /** Below `maxFileTabs`, closing the least recently used tabs. */
  private makeRoom(): void {
    const max = Math.max(1, this.options.maxFileTabs ?? Infinity);
    while (this.tabs.length >= max) {
      const oldest = [...this.tabs].sort((a, b) => a.lastActiveAt - b.lastActiveAt)[0];
      if (!oldest) return;
      this.close(oldest.id);
    }
  }

  /** Drops the tab's document (destroyed, or destroyed when its load ends) and sets it idle. */
  private unload(tab: FileTab): void {
    this.loads.delete(tab.id);
    if (tab.load.status === "ready") tab.load.document.destroy();
    if (tab.load.status !== "idle")
      this.publish({ tabs: patchTab(this.tabs, tab.id, () => ({ load: { status: "idle" } })) });
  }

  /** Starts a load nobody awaits; a failure is in the tab's `load`. */
  private loadQuietly(id: string): void {
    this.ensureLoaded(id).catch(() => undefined);
  }

  private publish(patch: Partial<FileTabsSnapshot>): void {
    if (this.disposed) return;
    this.store.set({ ...this.store.get(), ...patch });
  }
}
