import { useEffect } from "react";

import { toastProgress } from "@shared/stores/toast-store";
import { useEngine } from "./engine-context";
import { t } from "./canvas-ui.i18n";

/**
 * Handles the `copyAsPng` command (Ctrl+Shift+C and the context menu): copies the selection as a
 * PNG image, with a toast while it's drawn and when it's on the clipboard or failed.
 */
export function useCopyAsPng(): void {
  const engine = useEngine();
  useEffect(
    () =>
      engine.handleHostAction("copyAsPng", () => {
        if (engine.selectedIds().length === 0) return;
        void toastProgress(() => engine.copyAsPng(), {
          loading: t("copyPng.loading"),
          success: t("copyPng.success"),
          error: t("copyPng.error"),
        });
      }),
    [engine],
  );
}
