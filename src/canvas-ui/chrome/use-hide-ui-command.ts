import { useEffect } from "react";

import { useChromeStore } from "@shared/stores/chrome-store";
import { toast } from "@shared/stores/toast-store";
import { useEngine } from "../engine-context";
import { t } from "./chrome.i18n";

/**
 * Runs the `toggleUi` host command (Ctrl+\, as in Figma): hides the editor's UI so only the
 * canvas shows, or brings it back. Hiding tells how to come back; leaving the editor shows it again.
 */
export function useHideUiCommand(): void {
  const engine = useEngine();

  useEffect(() => {
    const remove = engine.handleHostAction("toggleUi", () => {
      const { hidden, setHidden } = useChromeStore.getState();
      setHidden(!hidden);
      if (!hidden) {
        const keys = engine.keymap.label("toggleUi");
        toast({
          title: t("hideUi.title"),
          description: keys ? t("hideUi.hint", { keys }) : undefined,
        });
      }
    });
    return () => {
      remove();
      useChromeStore.getState().setHidden(false);
    };
  }, [engine]);
}
