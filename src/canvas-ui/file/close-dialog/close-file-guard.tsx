import { useEffect, useRef, useState } from "react";

import { appLifecycle, tabsSupported } from "@platform";
import { useTabContext } from "../../tabs/tab-context";
import { tabHandles } from "../../tabs/tab-handles";
import { useCanvasFile } from "../canvas-file-context";
import { CloseFileDialog } from "./close-file-dialog";
import type { CloseChoice } from "./close-file-dialog.types";

/**
 * Asks before the window closes (its ✕, `appLifecycle.onCloseRequest`) while a file is open, where
 * there are no tabs (Android); on desktop the app's one guard asks for every tab. A joined live
 * session isn't a file here, so it doesn't ask. Sessions mount it for every file.
 */
export function CloseFileGuard() {
  const file = useCanvasFile();
  if (tabsSupported() || file.live?.side === "guest") return null;
  return <WindowCloseGuard />;
}

/**
 * The guard itself. The preview is taken while the dialog is open (the tab's `capture`), so
 * quitting goes straight on. Leaving the editor inside the app doesn't ask.
 */
function WindowCloseGuard() {
  const file = useCanvasFile();
  const { tabId } = useTabContext();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  /** How the pending question is answered. */
  const pending = useRef<((quit: boolean) => void) | null>(null);
  const unsaved = file.dirty && (!file.autosave || file.status === "error");

  useEffect(() => {
    const remove = appLifecycle.onCloseRequest(
      () =>
        new Promise<boolean>((resolve) => {
          pending.current?.(false);
          pending.current = resolve;
          setOpen(true);
          void tabHandles.get(tabId)?.capture();
        }),
    );
    return () => {
      remove();
      pending.current?.(false);
      pending.current = null;
    };
  }, [tabId]);

  const answer = (quit: boolean) => {
    const resolve = pending.current;
    pending.current = null;
    setOpen(false);
    resolve?.(quit);
  };

  const choose = (choice: CloseChoice) => {
    if (choice !== "save") {
      answer(choice === "close");
      return;
    }
    setBusy(true);
    void file
      .save()
      .then(answer)
      .finally(() => setBusy(false));
  };

  return (
    <CloseFileDialog open={open} name={file.name} unsaved={unsaved} busy={busy} onChoose={choose} />
  );
}
