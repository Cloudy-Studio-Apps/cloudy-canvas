import { useEffect } from "react";

import { tabsSupported } from "@platform";
import { useUnsavedChangesStore } from "@shared/stores/unsaved-changes-store";
import type { TabContextValue } from "../tabs/tab-context.types";

/**
 * Tells the file's tab whether it has unsaved changes (`dirty`: changes nothing will save, or an
 * autosave still pending; the tab's dot). Without tabs (Android) it sets the app's one flag
 * instead, so app-level actions warn before leaving the open file: only for `needsSave`, changes
 * nothing will save, since autosave flushes when the editor closes.
 */
export function useReportUnsaved(tab: TabContextValue, dirty: boolean, needsSave: boolean): void {
  useEffect(() => {
    tab.reportUnsaved(dirty);
    return () => tab.reportUnsaved(false);
  }, [tab, dirty]);

  useEffect(() => {
    if (tabsSupported()) return;
    const { setDirty } = useUnsavedChangesStore.getState();
    setDirty(needsSave);
    return () => setDirty(false);
  }, [needsSave]);
}
