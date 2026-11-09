import type { FileTab } from "@canvas/tabs";
import { debounce } from "@canvas/utils";
import { AUTOSAVE_DELAY_MS, AUTOSAVE_MAX_WAIT_MS } from "@canvas-ui/file/autosave-delays";
import type { CanvasFileFormat } from "@canvas-ui/file/canvas-file.types";
import { saveCanvasDocument } from "@canvas-ui/file/save-canvas-document";
import { appLifecycle } from "@platform";
import { useAutosaveStore } from "@shared/stores/autosave-store";
import { notifyError } from "@shared/stores/toast-store";
import { fileTabs } from "./file-tabs-instance";
import { t } from "./tabs.i18n";

const noop = (): void => undefined;

/**
 * Autosaves a tab's document while no editor does (a hosted file in the background: its guests
 * keep editing it), as the editor would: 1.5 s after changes stop, at most every 10 s, only while
 * autosave is on (turning it off saves what's there: the tab then gets its editor back), and
 * before the window closes. Each save
 * reports the file to the tab (`setInfo`), so an editor mounted again sees it, and the tab's
 * `unsaved` follows while a save is pending. Writes go in line with the editor's for the same file
 * (`saveCanvasDocument`). It starts with one save scheduled, since edits may have come in
 * after the editor's closing save and before it began watching. Returns how to stop; stopping
 * saves the pending changes at once (encoded then, so the document may go right after).
 */
export function startDocumentAutosave(tab: FileTab, format: CanvasFileFormat): () => void {
  if (tab.load.status !== "ready") return noop;
  const { id, fileId } = tab;
  const doc = tab.load.document;
  let info = tab.load.info;
  // A file never saved goes to its project's folder, like its editor's first save.
  const dir = info === null ? (tab.params.dir ?? null) : null;
  // Starts dirty: guests' edits that came between the editor's closing save and this observer
  // aren't counted by it, so the first save writes whatever the document holds now.
  let revision = 1;
  let savedRevision = 0;
  let failed = false;
  let stopped = false;
  let maxWait: ReturnType<typeof setTimeout> | undefined;

  const report = () => {
    const unsaved = revision !== savedRevision;
    const current = fileTabs.get(id);
    if (!stopped && current && current.unsaved !== unsaved) fileTabs.patch(id, { unsaved });
  };
  const cancel = () => {
    debounced.cancel();
    clearTimeout(maxWait);
    maxWait = undefined;
  };
  const save = async (): Promise<void> => {
    cancel();
    if (revision === savedRevision) return;
    const at = revision;
    try {
      const file = await saveCanvasDocument({ id: fileId, doc, info, format, dir });
      info = file;
      fileTabs.setInfo(id, file);
      savedRevision = Math.max(savedRevision, at);
      failed = false;
    } catch (error) {
      if (!failed) notifyError(t("autosave.failed", { noun: format.noun }), error);
      failed = true;
    }
    report();
  };
  const debounced = debounce(() => void save(), AUTOSAVE_DELAY_MS);
  const schedule = () => {
    if (!useAutosaveStore.getState().enabled) return;
    debounced();
    maxWait ??= setTimeout(() => void save(), AUTOSAVE_MAX_WAIT_MS);
  };

  const removeObserver = doc.onChange(() => {
    revision += 1;
    report();
    schedule();
  });
  const removeSetting = useAutosaveStore.subscribe((state, previous) => {
    if (state.enabled === previous.enabled) return;
    // Turned on: what changed meanwhile is saved soon; turned off: what's there is saved now.
    if (state.enabled) schedule();
    else void save();
  });
  const removeQuitTask = appLifecycle.onBeforeQuit(async () => {
    if (useAutosaveStore.getState().enabled) await save();
  });
  report();
  schedule();

  return () => {
    if (stopped) return;
    cancel();
    removeObserver();
    removeSetting();
    // Whatever is pending, autosave on or not: with it off the tab gets its editor back, which
    // starts from what's saved.
    const last = save();
    stopped = true;
    // Quitting still waits for that last save.
    void last.finally(removeQuitTask);
  };
}
