import { useEditorModules, useEngineState } from "@canvas-ui";
import { designEditor, tabsForMode } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import type { LeftTabs } from "./use-left-tabs.types";

/**
 * The left panel tabs of the current mode, and the one showing. The picked tab is kept while a
 * mode without it is on, so leaving the mode shows it again.
 */
export function useLeftTabs(): LeftTabs {
  const { host } = useEditorModules();
  const mode = useEngineState((state) => state.mode);
  const picked = useDesignPanelStore((state) => state.leftTab);
  const keep = host.find(designEditor.modePanels, mode)?.keepTabs;
  const tabs = tabsForMode(host.get(designEditor.leftTabs), mode, keep);
  return { tabs, current: tabs.find((tab) => tab.id === picked) ?? tabs[0] };
}
