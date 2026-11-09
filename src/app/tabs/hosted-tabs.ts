import type { CanvasDocument } from "@canvas";
import type { FileTab, FileTabs } from "@canvas/tabs";
import { sharingState } from "@canvas-ui/share/sharing-state";
import { tabLeaveGuard } from "@canvas-ui/tabs/tab-leave-guard";
import { startDocumentAutosave } from "./document-autosave";
import { FILE_FORMATS } from "./file-formats";

/** The document autosaves running, by tab id, with the document each saves. */
const running = new Map<string, { document: CanvasDocument; stop: () => void }>();
/** Autosaves waiting for their tab's editor to go, by tab id; a newer wait replaces the token. */
const starting = new Map<string, symbol>();

/** A hosted file's tab with its document but no editor: its guests' edits need saving. */
function needsAutosave(tab: FileTab): boolean {
  return tab.hosting && tab.state === "document" && tab.load.status === "ready";
}

function documentOf(tab: FileTab | undefined): CanvasDocument | null {
  return tab?.load.status === "ready" ? tab.load.document : null;
}

/**
 * Keeps the hosted file's tab live without an editor (desktop): marks the tab of the file this app
 * shares `hosting` (`sharingState`, whether its editor is mounted or not), and while that tab is
 * `document` saves its document (`startDocumentAutosave`), from once its editor's closing save is
 * done (`tabLeaveGuard.unmounted`) until an editor mounts for it again, sharing stops or the tab
 * closes. Returns how to stop watching.
 */
export function watchHostedTabs(tabs: FileTabs): () => void {
  const syncHosting = () => {
    const shared = sharingState.fileId();
    for (const tab of tabs.store.get().tabs) {
      const hosting = tab.fileId === shared;
      if (tab.hosting !== hosting) tabs.patch(tab.id, { hosting });
    }
  };

  const begin = async (tab: FileTab) => {
    const token = Symbol(tab.id);
    starting.set(tab.id, token);
    const document = documentOf(tab);
    try {
      // Before the editor unmounts (this runs as the tab changes), so its closing save is seen.
      await tabLeaveGuard.unmounted(tab.id);
      const format = await FILE_FORMATS[tab.type]();
      const now = tabs.get(tab.id);
      if (starting.get(tab.id) !== token || !now || !needsAutosave(now)) return;
      if (documentOf(now) !== document || !document) return;
      running.set(tab.id, { document, stop: startDocumentAutosave(now, format) });
    } catch (error) {
      console.warn(`File tab ${tab.id} couldn't autosave without its editor.`, error);
    } finally {
      if (starting.get(tab.id) === token) starting.delete(tab.id);
    }
  };

  const sync = () => {
    for (const [id, entry] of running) {
      const tab = tabs.get(id);
      if (!tab || !needsAutosave(tab) || documentOf(tab) !== entry.document) {
        stopDocumentAutosave(id);
      }
    }
    for (const id of starting.keys()) {
      const tab = tabs.get(id);
      if (!tab || !needsAutosave(tab)) starting.delete(id);
    }
    for (const tab of tabs.store.get().tabs) {
      if (needsAutosave(tab) && !running.has(tab.id) && !starting.has(tab.id)) void begin(tab);
    }
  };

  syncHosting();
  sync();
  const stopSharingWatch = sharingState.subscribe(syncHosting);
  const stopTabsWatch = tabs.store.subscribe(() => {
    syncHosting();
    sync();
  });
  return () => {
    stopSharingWatch();
    stopTabsWatch();
    for (const id of [...running.keys()]) stopDocumentAutosave(id);
    starting.clear();
  };
}

/**
 * Stops the tab's document autosave, saving its pending changes (encoded now); `closeTab` calls
 * it before the document goes.
 */
export function stopDocumentAutosave(id: string): void {
  const entry = running.get(id);
  if (!entry) return;
  running.delete(id);
  entry.stop();
}
