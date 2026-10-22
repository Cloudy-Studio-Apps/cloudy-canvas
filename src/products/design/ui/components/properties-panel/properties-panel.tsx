import { Bot, Download } from "lucide-react";

import { HistoryControls, ToolButton, ZoomMenu } from "@canvas-ui";
import { AgentServerMenu } from "@shared/agent-server";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { Button } from "@shared/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { useDesignEngine } from "../../design-engine-context";
import { DESIGN_LAYOUT } from "../../design-layout";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { PropertySections } from "./property-sections";

/** The right panel: history, agents and export, then the Design/Prototype tabs and the zoom. */
export function PropertiesPanel() {
  const engine = useDesignEngine();
  const agentsEnabled = useAgentServerStore((state) => state.enabled);
  const tab = useDesignPanelStore((state) => state.propertiesTab);
  const setTab = useDesignPanelStore((state) => state.setPropertiesTab);

  return (
    <aside
      aria-label="Properties"
      className="flex shrink-0 flex-col border-l bg-surface"
      style={{ width: DESIGN_LAYOUT.rightPanel }}
    >
      <header className="flex h-12 items-center gap-0.5 border-b px-2">
        <HistoryControls />
        <AgentServerMenu
          trigger={
            <ToolButton
              label={agentsEnabled ? "Agents: on" : "Agents: off"}
              side="bottom"
              className={agentsEnabled ? undefined : "text-muted-foreground"}
            >
              <Bot />
            </ToolButton>
          }
        />
        <div className="flex-1" />
        <Button size="sm" onClick={() => engine.commands.export?.()}>
          <Download />
          Export
        </Button>
      </header>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value === "prototype" ? "prototype" : "design")}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-2">
          <TabsList className="h-7">
            <TabsTrigger value="design" className="px-2.5 text-xs">
              Design
            </TabsTrigger>
            <TabsTrigger value="prototype" className="px-2.5 text-xs">
              Prototype
            </TabsTrigger>
          </TabsList>
          <ZoomMenu side="bottom" />
        </div>
        <TabsContent value="design" className="min-h-0 overflow-y-auto">
          <PropertySections tab="design" />
        </TabsContent>
        <TabsContent value="prototype" className="min-h-0 overflow-y-auto">
          <PropertySections tab="prototype" />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
