import { useEffect } from "react";

import type { CanvasEngine } from "@canvas";
import type { FileDrop } from "@shared/core";
import { useFileDropStore } from "@shared/stores/file-drop-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { t } from "./canvas-ui.i18n";

/**
 * Adds files dropped on the window to the engine's canvas while mounted (images, SVGs and `.txt`
 * files; canvas files still open). Files it can't add are reported with a toast.
 */
export function useCanvasFileDrop<O extends object>(engine: CanvasEngine<O> | null): void {
  useEffect(() => {
    if (!engine) return;
    const target = (drop: FileDrop) => void dropOn(engine, drop);
    useFileDropStore.getState().setTarget(target);
    return () => {
      if (useFileDropStore.getState().target === target) {
        useFileDropStore.getState().setTarget(null);
      }
    };
  }, [engine]);
}

async function dropOn<O extends object>(engine: CanvasEngine<O>, drop: FileDrop): Promise<void> {
  try {
    const { skipped } = await engine.dropFiles(drop.files, drop.at);
    if (skipped.length === 0) return;
    toast({
      title:
        skipped.length === 1
          ? t("drop.oneFailed", { name: skipped[0] ?? "" })
          : t("drop.manyFailed", { count: skipped.length }),
      description: t("drop.hint"),
      tone: "error",
    });
  } catch (error) {
    notifyError(t("drop.error"), error);
  }
}
