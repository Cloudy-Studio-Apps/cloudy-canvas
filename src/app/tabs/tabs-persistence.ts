import type { FileTab, FileTabs } from "@canvas/tabs";
import { debounce } from "@canvas/utils";
import { storage, tabsSupported } from "@platform";
import { tabRoute } from "./tab-route";
import type { SavedTab, SavedTabs, TabsPersistenceOptions } from "./tabs-persistence.types";

const KEY = "cloudy-canvas:tabs";
const SAVE_DELAY_MS = 500;

let started = false;

function read(): SavedTabs | null {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? (JSON.parse(raw) as Partial<SavedTabs>) : null;
    if (!data || !Array.isArray(data.tabs)) return null;
    const tabs = data.tabs.filter(
      (tab): tab is SavedTab =>
        (tab?.type === "board" || tab?.type === "design") && typeof tab.fileId === "string",
    );
    return { tabs, active: typeof data.active === "string" ? data.active : null };
  } catch {
    return null;
  }
}

function write(saved: SavedTabs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Storage blocked or full: the tabs just aren't reopened next time.
  }
}

/** A tab that can be reopened: not a joined session, not a file never saved anywhere. */
function reopenable(tab: FileTab): boolean {
  if (tab.live || tab.fileId.startsWith("live:")) return false;
  return tab.load.status !== "ready" || tab.load.info !== null;
}

function snapshot(tabs: FileTabs): SavedTabs {
  const { tabs: open, activeId } = tabs.store.get();
  const saved = open.filter(reopenable);
  const active = saved.find((tab) => tab.id === activeId);
  return {
    tabs: saved.map(({ type, fileId }) => ({ type, fileId })),
    active: active?.fileId ?? null,
  };
}

/**
 * Opens the saved files hibernated, in order; files gone from storage (drafts are kept) drop.
 * Nothing happens once `stopped()`, and the saved active tab is shown only if the app is still on
 * Home: the user may have gone elsewhere while the files were looked up.
 */
async function restore(
  tabs: FileTabs,
  options: TabsPersistenceOptions,
  stopped: () => boolean,
): Promise<void> {
  const saved = read();
  if (!saved) return;
  const found: SavedTab[] = [];
  for (const tab of saved.tabs) {
    try {
      if (await storage.get(tab.fileId)) found.push(tab);
    } catch {
      // Unreadable now: leave it out rather than open a tab that can't load.
    }
  }
  if (stopped()) return;
  for (const { type, fileId } of found) tabs.open({ type, fileId }, { activate: false });
  // A launch to a file chose its own active tab; only a start on Home takes the saved one, and
  // only while the user is still there (not on Settings or Projects meanwhile).
  const active = found.find((tab) => tab.fileId === saved.active);
  const onHome = window.location.pathname === "/" && tabs.store.get().activeId === null;
  if (options.startedOnHome && active && onHome) {
    options.navigate(tabRoute(active));
  }
}

/**
 * Remembers the open file tabs across restarts (desktop). Once, at startup, it opens the last
 * session's files hibernated (nothing loads) and shows the one that was active, if the app started
 * on Home; then it saves the tabs to `localStorage` whenever they change. Returns how to stop.
 */
export function startTabsPersistence(tabs: FileTabs, options: TabsPersistenceOptions): () => void {
  if (!tabsSupported() || started) return () => {};
  started = true;
  let stopped = false;
  let unsubscribe = () => {};
  const save = debounce(() => write(snapshot(tabs)), SAVE_DELAY_MS);
  const saveNow = () => {
    save.cancel();
    write(snapshot(tabs));
  };

  void restore(tabs, options, () => stopped)
    .catch(() => {})
    .then(() => {
      if (stopped) return;
      unsubscribe = tabs.store.subscribe(save);
      window.addEventListener("pagehide", saveNow);
      save();
    });

  return () => {
    stopped = true;
    started = false;
    unsubscribe();
    window.removeEventListener("pagehide", saveNow);
    save.cancel();
  };
}
