import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { bindData } from "../../bindings";
import type { ApplyBindData } from "./use-bind-data.types";
import { t } from "../../data.i18n";

/** `bindData` on one layer, one undo step; the data sync then fills it. */
export function useBindData(nodeId: string): ApplyBindData {
  const engine = useDesignEngine();
  return (patch) => {
    try {
      bindData(engine.doc, nodeId, patch, engine.kinds);
    } catch (error) {
      notifyError(t("section.failed"), error);
    }
  };
}
