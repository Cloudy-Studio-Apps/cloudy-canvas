import { ExtensionIconView, ToolButton, useEditorModules } from "@canvas-ui";
import { DESIGN_LAYOUT } from "../../design-layout";
import { designEditor } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { DesignMainMenu } from "./design-main-menu";

/** The strip along the left edge: the main menu, then a button per left panel tab (`leftTabs`). */
export function DesignRail() {
  const { host } = useEditorModules();
  const tabs = [...host.get(designEditor.leftTabs)].sort((a, b) => a.order - b.order);
  const active = useDesignPanelStore((state) => state.leftTab);
  const setTab = useDesignPanelStore((state) => state.setLeftTab);

  return (
    <nav
      aria-label="Panels"
      className="flex shrink-0 flex-col items-center gap-1 border-r bg-surface py-2"
      style={{ width: DESIGN_LAYOUT.rail }}
    >
      <DesignMainMenu />
      {tabs.map((tab) => (
        <ToolButton
          key={tab.id}
          label={tab.label}
          side="bottom"
          active={tab.id === active}
          onClick={() => setTab(tab.id)}
        >
          <ExtensionIconView icon={tab.icon} />
        </ToolButton>
      ))}
    </nav>
  );
}
