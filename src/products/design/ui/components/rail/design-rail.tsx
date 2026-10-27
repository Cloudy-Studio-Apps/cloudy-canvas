import { Bot, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { CollaboratorUndoButton, ExtensionIconView, ToolButton } from "@canvas-ui";
import { AgentServerMenu } from "@shared/agent-server";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { DESIGN_LAYOUT } from "../../design-layout";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { useLeftTabs } from "../left-panel";
import { DesignMainMenu } from "./design-main-menu";
import { t } from "../../design-ui.i18n";

/**
 * The strip along the left edge: the main menu, a button per left panel tab of the current mode
 * (`leftTabs`; with the panel closed, one opens it on that tab) and, at the bottom, the agents menu
 * and the button that opens or closes the panel.
 */
export function DesignRail() {
  const { tabs, current } = useLeftTabs();
  const active = current?.id;
  const open = useDesignPanelStore((state) => state.leftOpen);
  const setTab = useDesignPanelStore((state) => state.setLeftTab);
  const setOpen = useDesignPanelStore((state) => state.setLeftOpen);
  const agentsEnabled = useAgentServerStore((state) => state.enabled);

  return (
    <nav
      aria-label={t("rail.label")}
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
      <AgentServerMenu
        side="right"
        align="end"
        followable
        agentActions={(agent) => <CollaboratorUndoButton collaborator={agent} />}
        trigger={
          <ToolButton
            label={agentsEnabled ? t("rail.agentsOn") : t("rail.agentsOff")}
            side="right"
            className={agentsEnabled ? undefined : "text-muted-foreground"}
          >
            <Bot />
          </ToolButton>
        }
      />
      <ToolButton
        label={open ? t("rail.hide") : t("rail.show")}
        side="right"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <PanelLeftClose /> : <PanelLeftOpen />}
      </ToolButton>
    </nav>
  );
}
