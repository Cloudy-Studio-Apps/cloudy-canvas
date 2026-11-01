import { useState } from "react";

import type { DesignNode } from "../../core";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast, toastProgress } from "@shared/stores/toast-store";
import { plannedExports, renderExports } from "../export-nodes";
import { t } from "../layer-export.i18n";
import { useSaveExports } from "./use-save-exports";

/** What the zip of several layers is called. */
const ZIP_NAME = "exports";

/**
 * Makes the files of the layers' exports: one goes through the save dialog, several into a folder
 * or a zip, as chosen (asking first, through `overwrite`, when files would be replaced).
 */
export function useExportNodes(nodes: readonly DesignNode[]) {
  const engine = useDesignEngine();
  const [busy, setBusy] = useState(false);
  const { save, overwrite } = useSaveExports();
  const planned = plannedExports(engine, nodes);

  const run = async () => {
    setBusy(true);
    try {
      const count = planned.length;
      const files = await toastProgress(() => renderExports(engine, planned), {
        loading: t("progress", { count }),
        error: t("failed"),
      });
      const name = nodes.length === 1 && nodes[0] ? nodes[0].name || ZIP_NAME : ZIP_NAME;
      if (files && (await save(files, name))) toast({ title: t("done", { count }) });
    } catch (error) {
      notifyError(t("saveError"), error);
    } finally {
      setBusy(false);
    }
  };

  return { count: planned.length, busy, run, overwrite };
}
