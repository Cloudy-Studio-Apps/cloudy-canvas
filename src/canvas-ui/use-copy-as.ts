import { useEffect } from "react";

import { toastProgress } from "@shared/stores/toast-store";
import { useEngine } from "./engine-context";
import { t } from "./canvas-ui.i18n";

/**
 * Handles the `copyAsPng` (Ctrl+Shift+C and the context menu) and `copyAsSvg` commands: copies the
 * selection as a PNG image or as SVG text, with a toast while it's made and when it's on the
 * clipboard or failed.
 */
export function useCopyAs(): void {
  const engine = useEngine();
  useEffect(() => {
    const png = engine.handleHostAction("copyAsPng", () => {
      if (engine.selectedIds().length === 0) return;
      void toastProgress(() => engine.copyAsPng(), {
        loading: t("copyPng.loading"),
        success: t("copyPng.success"),
        error: t("copyPng.error"),
      });
    });
    const svg = engine.handleHostAction("copyAsSvg", () => {
      if (engine.selectedIds().length === 0) return;
      void toastProgress(() => engine.copyAsSvg(), {
        loading: t("copySvg.loading"),
        success: t("copySvg.success"),
        error: t("copySvg.error"),
      });
    });
    return () => {
      png();
      svg();
    };
  }, [engine]);
}
