import { useEffect, useRef, useState } from "react";

import { SaveChangesDialog, type SaveChangesChoice } from "@canvas-ui/file/close-dialog";
import { tabHandles } from "@canvas-ui/tabs/tab-handles";
import { appLifecycle } from "@platform";
import type { PendingQuit, UnsavedTab } from "./app-close-guard.types";
import { fileTabs } from "./file-tabs-instance";
import { t } from "./tabs.i18n";

/** How long closing the window waits for the flushes and previews before going on. */
const SETTLE_TIMEOUT_MS = 5000;

/** `work`, or nothing once the timeout is up, so a stuck save never keeps the window open. */
const within = (work: Promise<unknown>) =>
  Promise.race([work, new Promise((resolve) => setTimeout(resolve, SETTLE_TIMEOUT_MS))]);

/** The open tabs whose editor is mounted, with their handles (hibernated tabs have nothing to save). */
function mountedTabs(): UnsavedTab[] {
  return fileTabs.store.get().tabs.flatMap((tab) => {
    const handle = tabHandles.get(tab.id);
    return handle ? [{ name: tab.name, handle }] : [];
  });
}

/**
 * The window's one close guard on desktop (`appLifecycle.onCloseRequest`), for every tab: it
 * flushes each tab's pending autosave and takes the previews, then quits, or asks once when some
 * tab has changes nothing will save (autosave off or failing): Save all and quit · Quit without
 * saving · Cancel. The quit tasks (each editor's last save) run after it, as before tabs.
 */
export function AppCloseGuard() {
  const [names, setNames] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef<PendingQuit | null>(null);

  useEffect(() => {
    const answer = (quit: boolean) => {
      pending.current?.resolve(quit);
      pending.current = null;
      setNames(null);
    };
    const remove = appLifecycle.onCloseRequest(async () => {
      answer(false);
      const tabs = mountedTabs();
      await within(Promise.allSettled(tabs.map(({ handle }) => handle.flush())));
      const unsaved = tabs.filter(({ handle }) => handle.needsSave());
      const captures = within(Promise.allSettled(tabs.map(({ handle }) => handle.capture())));
      if (unsaved.length === 0) {
        await captures;
        return true;
      }
      return new Promise<boolean>((resolve) => {
        pending.current = { resolve, tabs: unsaved };
        setNames(unsaved.map(({ name }) => name));
      });
    });
    return () => {
      remove();
      answer(false);
    };
  }, []);

  const choose = (choice: SaveChangesChoice) => {
    const current = pending.current;
    if (!current) return;
    const answer = (quit: boolean) => {
      if (pending.current !== current) return;
      pending.current = null;
      setNames(null);
      current.resolve(quit);
    };
    if (choice !== "save") {
      answer(choice === "discard");
      return;
    }
    setBusy(true);
    void saveAll(current.tabs)
      .then(answer)
      .finally(() => setBusy(false));
  };

  const count = names?.length ?? 0;
  return (
    <SaveChangesDialog
      open={names !== null}
      title={t("quit.title")}
      description={
        count === 1
          ? t("quit.one", { name: names?.[0] ?? "" })
          : t("quit.many", { count, names: names?.join(", ") ?? "" })
      }
      saveLabel={count === 1 ? t("quit.saveOne") : t("quit.saveAll")}
      discardLabel={t("quit.discard")}
      busy={busy}
      onChoose={choose}
    />
  );
}

/** Saves each tab in turn (one Save dialog at a time); `false` once one is cancelled or fails. */
async function saveAll(tabs: readonly UnsavedTab[]): Promise<boolean> {
  for (const { handle } of tabs) {
    if (!(await handle.save().catch(() => false))) return false;
  }
  return true;
}
