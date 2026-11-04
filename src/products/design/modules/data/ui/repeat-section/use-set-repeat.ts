import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { setRepeat } from "../../repeat";
import { errorText, translatedError } from "../data-tab/error-text";
import type { ApplyRepeat } from "./use-set-repeat.types";
import { t } from "../../data.i18n";

/** `setRepeat` on one frame, one undo step; the data sync then makes its copies. */
export function useSetRepeat(frameId: string): ApplyRepeat {
  const engine = useDesignEngine();
  return (repeat, opts) => {
    try {
      setRepeat(engine.doc, frameId, repeat, opts);
      return null;
    } catch (error) {
      notifyError(t("repeat.failed"), translatedError(error));
      return error instanceof Error ? errorText(error.message) : String(error);
    }
  };
}
