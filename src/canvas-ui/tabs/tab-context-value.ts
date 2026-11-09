import type { FileTabs } from "@canvas";
import type { TabContextValue } from "./tab-context.types";

/** The context of the tab `tabId`: what its file reports goes to the tab (changes only). */
export function tabContextValue(tabs: FileTabs, tabId: string): TabContextValue {
  return {
    tabs,
    tabId,
    reportUnsaved(unsaved) {
      const tab = tabs.get(tabId);
      if (tab && tab.unsaved !== unsaved) tabs.patch(tabId, { unsaved });
    },
    reportInfo(info) {
      tabs.setInfo(tabId, info);
    },
    reportName(name) {
      const tab = tabs.get(tabId);
      if (tab && tab.name !== name) tabs.patch(tabId, { name });
    },
  };
}
