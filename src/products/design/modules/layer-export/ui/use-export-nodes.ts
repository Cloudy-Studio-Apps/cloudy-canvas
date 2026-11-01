import { useState } from "react";

import type { DesignNode } from "../../core";
import { useOverwritePrompt } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { exportFile, exportFiles } from "@platform";
import { notifyError, toast, toastProgress } from "@shared/stores/toast-store";
import { plannedExports, renderExports } from "../export-nodes";
import type { RenderedExport } from "../export-nodes.types";
import { t } from "../layer-export.i18n";
import { useExportDestinationStore } from "./export-destination-store";

/** What the zip of several layers is called. */
const ZIP_NAME = "exports";

/**
 * Makes the files of the layers' exports: one goes through the save dialog, several into a folder
 * or a zip, as chosen (asking first, through `overwrite`, when files would be replaced).
 */
export function useExportNodes(nodes: readonly DesignNode[]) {
  const engine = useDesignEngine();
  const [busy, setBusy] = useState(false);
  const overwrite = useOverwritePrompt();
  const destination = useExportDestinationStore((state) => state.destination);
  const planned = plannedExports(engine, nodes);

  const save = async (files: readonly RenderedExport[]): Promise<boolean> => {
    const [only] = files;
    if (files.length === 1 && only) {
      const dot = only.path.lastIndexOf(".");
      const extension = only.path.slice(dot + 1);
      return exportFile(only.file, only.path.slice(0, dot), {
        extension,
        label: extension.toUpperCase(),
      });
    }
    const entries = await Promise.all(
      files.map(async ({ path, file }) => ({
        path,
        content: new Uint8Array(await file.arrayBuffer()),
      })),
    );
    const name = nodes.length === 1 && nodes[0] ? nodes[0].name || ZIP_NAME : ZIP_NAME;
    return exportFiles(entries, name, overwrite.confirm, { as: destination });
  };

  const run = async () => {
    setBusy(true);
    try {
      const count = planned.length;
      const files = await toastProgress(() => renderExports(engine, planned), {
        loading: t("progress", { count }),
        error: t("failed"),
      });
      if (files && (await save(files))) toast({ title: t("done", { count }) });
    } catch (error) {
      notifyError(t("saveError"), error);
    } finally {
      setBusy(false);
    }
  };

  return { count: planned.length, busy, run, overwrite };
}
