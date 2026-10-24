import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { ExtensionIconView, ToolButton, useEditorModules } from "@canvas-ui";
import { DESIGN_LAYOUT } from "../../design-layout";
import { designEditor } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { DesignMainMenu } from "./design-main-menu";

/**
 * The strip along the left edge: the main menu, a button per left panel tab (`leftTabs`; with the
 * panel closed, one opens it on that tab) and, at the bottom, the button that opens or closes it.
 */
export function DesignRail() {
  const { host } = useEditorModules();
  const tabs = [...host.get(designEditor.leftTabs)].sort((a, b) => a.order - b.order);
  const active = useDesignPanelStore((state) => state.leftTab);
  const open = useDesignPanelStore((state) => state.leftOpen);
  const setTab = useDesignPanelStore((state) => state.setLeftTab);
  const setOpen = useDesignPanelStore((state) => state.setLeftOpen);

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
          active={open && tab.id === active}
          onClick={() => {
            setTab(tab.id);
            setOpen(true);
          }}
        >
          <ExtensionIconView icon={tab.icon} />
        </ToolButton>
      ))}
      <div className="flex-1" />
      <ToolButton
        label={open ? "Hide left panel" : "Show left panel"}
        side="right"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <PanelLeftClose /> : <PanelLeftOpen />}
      </ToolButton>
    </nav>
  );
}
