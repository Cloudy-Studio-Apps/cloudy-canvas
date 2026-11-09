import type { FileInfo } from "@shared/core";
import type { CanvasDocument } from "../document";
import { Store } from "../utils";
import type {
  FileTab,
  FileTabsOptions,
  FileTabsSnapshot,
  OpenTabOptions,
  TabLeaveGuard,
  TabSource,
  TabState,
} from "./file-tabs.types";
import { ClosedTabs } from "./closed-tabs";
import { bindAgentTo, countAgentCall, unbindAgentFrom } from "./tab-agents";
import { createTab, moveTab, patchTab, tabFileId } from "./tab-list";
import { TabLoads } from "./tab-loads";
import { TabMemory } from "./tab-memory";

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
  /** Each tab's document load (`TabLoads`). */
  private readonly loads: TabLoads;
  private readonly closed = new ClosedTabs();
  private disposed = false;
  /** The memory policy, applied after every change. */
  private readonly memory: TabMemory;

  constructor(options: FileTabsOptions) {
    this.options = options;
    this.now = options.now ?? Date.now;
    this.loads = new TabLoads({
      loaders: options.loaders,
      get: (id) => this.get(id),
      source: (id) => this.sources.get(id),
      patch: (id, patch) => this.publish({ tabs: patchTab(this.tabs, id, patch) }),
    });
    this.memory = new TabMemory({
      store: this.store,
      get: (id) => this.get(id),
      setState: (id, state) => this.setState(id, state),
      now: this.now,
    });
  }

  open(source: TabSource, options: OpenTabOptions = {}): FileTab {
    const activate = options.activate ?? true;
    const existing = this.byFileId(tabFileId(source));
    if (existing) {
      if (activate) this.activate(existing.id);
      return this.get(existing.id) ?? existing;
    }
    this.makeRoom(activate);
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
    if (id) this.loads.quietly(id);
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
    this.loads.unload(tab);
    tab.live?.leave();
    this.sources.delete(id);
    this.memory.forget(id);
    this.publish({ tabs: this.tabs.filter((other) => other.id !== id) });
    if (source) this.closed.remember(source, tab);
  }

  /** Opens the last closed tab again, or `null` when none is remembered. */
  reopenClosed(): FileTab | null {
    const source = this.closed.takeLast();
    return source ? this.open(source) : null;
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
    if (state === "hibernated") this.loads.unload(tab);
    this.publish({ tabs: patchTab(this.tabs, id, () => ({ state })) });
    if (state !== "hibernated") this.loads.quietly(id);
  }

  /** The tab's document, loading it once; concurrent calls share one load. */
  ensureLoaded(id: string): Promise<CanvasDocument> {
    return this.loads.ensure(id);
  }

  /** Binds an agent session to the tab, moving it out of the tab it was in. */
  bindAgent(id: string, session: string): void {
    this.publish({ tabs: bindAgentTo(this.tabs, id, session) });
  }

  unbindAgent(session: string): void {
    this.publish({ tabs: unbindAgentFrom(this.tabs, session) });
  }

  noteAgentCall(id: string): void {
    this.publish({ tabs: countAgentCall(this.tabs, id, 0, this.now()) });
  }

  /**
   * An agent call starts in the tab: until its `endAgentCall`, the memory policy keeps (or brings
   * back) its engine, past `maxHeadless` too, and a leave in progress gives up.
   */
  beginAgentCall(id: string): void {
    this.publish({ tabs: countAgentCall(this.tabs, id, 1, this.now()) });
  }

  /** An agent call that `beginAgentCall` started in the tab is over. */
  endAgentCall(id: string): void {
    this.publish({ tabs: countAgentCall(this.tabs, id, -1, this.now()) });
  }

  // The memory policy (`TabMemory`, see the README): what the host does before a background
  // tab's editor goes (without a guard, at once), whether autosave is on (off, a hosted tab keeps
  // its editor), applying it now (it runs after every change) and on a timer (time alone moves
  // tabs down), returning how to stop.
  setLeaveGuard(guard: TabLeaveGuard): () => void {
    return this.memory.setGuard(guard);
  }

  setAutosave(enabled: boolean): void {
    this.memory.setAutosave(enabled);
  }

  evaluate(): void {
    this.memory.evaluate();
  }

  startPolicy(): () => void {
    return this.memory.start();
  }

  /** Destroys every tab's document and leaves their live sessions. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.memory.dispose();
    for (const tab of this.tabs) {
      this.loads.unload(tab);
      tab.live?.leave();
    }
    this.sources.clear();
    this.closed.clear();
    this.store.set({ tabs: [], activeId: null });
    this.store.destroy();
  }

  private get tabs(): readonly FileTab[] {
    return this.store.get().tabs;
  }

  /**
   * Below `maxFileTabs`, closing the least recently used tabs. The one on screen goes only for a
   * tab about to replace it (`activate`): the view never jumps on its own. A safety net only: it
   * destroys the document before an editor's closing work, so a host that limits the tabs (Android)
   * closes the open one itself first, through its editor.
   */
  private makeRoom(activate: boolean): void {
    const max = Math.max(1, this.options.maxFileTabs ?? Infinity);
    while (this.tabs.length >= max) {
      const { activeId } = this.store.get();
      const oldest = this.tabs
        .filter((tab) => activate || tab.id !== activeId)
        .sort((a, b) => a.lastActiveAt - b.lastActiveAt)[0];
      if (!oldest) return;
      this.close(oldest.id);
    }
  }

  private publish(patch: Partial<FileTabsSnapshot>): void {
    if (this.disposed) return;
    this.store.set({ ...this.store.get(), ...patch });
  }
}
