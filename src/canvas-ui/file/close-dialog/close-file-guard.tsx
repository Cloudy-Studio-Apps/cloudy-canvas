import { useEffect, useRef, useState } from "react";

import { appLifecycle } from "@platform";
import { useCanvasFile } from "../canvas-file-context";
import { CloseFileDialog } from "./close-file-dialog";
import type { CloseChoice, CloseFileGuardProps } from "./close-file-dialog.types";

/**
 * Asks before the window closes (its ✕, `appLifecycle.onCloseRequest`) while a file is open.
 * The preview is taken while the dialog is open, so quitting goes straight on. Leaving the editor
 * inside the app doesn't ask.
 */
export function CloseFileGuard({ capture }: CloseFileGuardProps) {
  const file = useCanvasFile();
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
          void capture();
        }),
    );
    return () => {
      remove();
      pending.current?.(false);
      pending.current = null;
    };
  }, [capture]);

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
