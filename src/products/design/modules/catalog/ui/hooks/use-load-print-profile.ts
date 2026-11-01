import { useCallback } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { openFile, type OpenFilePick } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../../catalog.i18n";
import { loadPrintProfile } from "../../export/load-print-profile";
import { useBrochure } from "./use-brochure";

const PROFILE_FILES: OpenFilePick = {
  title: t("print.profileDialog"),
  filters: [{ name: t("print.profileFiles"), extensions: ["icc", "icm"] }],
};

/** Asks for a print shop's `.icc` file and keeps it in the design, on the open brochure. */
export function useLoadPrintProfile(): () => Promise<void> {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  return useCallback(async () => {
    try {
      const file = await openFile(PROFILE_FILES);
      if (!file || !brochure) return;
      await loadPrintProfile(engine, brochure, file.bytes);
    } catch (error) {
      notifyError(t("print.profileError"), error);
    }
  }, [engine, brochure]);
}
