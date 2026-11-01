import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { EXPORT_ALL_COMMAND } from "../export-all.constants";
import { useExportAllStore } from "./export-all-store";

/** Runs the Export all command: opens its dialog. */
export function useExportAllCommand(): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      engine.handleHostAction(EXPORT_ALL_COMMAND, () => {
        useExportAllStore.getState().setOpen(true);
      }),
    [engine],
  );
}
