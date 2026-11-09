import type { FileTab, FileTabsSnapshot } from "@canvas";
import { TabEditorSlot } from "./tab-editor-slot";
import type { TabHostProps } from "./tab-host.types";
import { useFileTabs, useFileTabsModel } from "./use-file-tabs";

const selectTabs = (snapshot: FileTabsSnapshot) => snapshot.tabs;
const selectActive = (snapshot: FileTabsSnapshot) => snapshot.activeId;

/** Whether the tab has an editor mounted: the one on screen, and those kept headless. */
const mounted = (tab: FileTab) => tab.state === "active" || tab.state === "headless";

/**
 * The editors of the open file tabs, over the whole window: one per tab that needs an engine (the
 * active one and the headless ones), each in its `TabContext`. Only the active tab's is shown.
 */
export function TabHost({ editors }: TabHostProps) {
  const fileTabs = useFileTabsModel();
  const tabs = useFileTabs(selectTabs);
  const activeId = useFileTabs(selectActive);
  return (
    <>
      {tabs.filter(mounted).map((tab) => (
        <TabEditorSlot
          key={tab.id}
          tabs={fileTabs}
          tab={tab}
          active={tab.id === activeId}
          Editor={editors[tab.type]}
        />
      ))}
    </>
  );
}
