import { Bot, Download, PanelRightClose } from "lucide-react";

import {
  CollaboratorUndoButton,
  HistoryControls,
  ToolButton,
  useEditorModules,
  useEngineState,
  ZoomMenu,
} from "@canvas-ui";
import { AgentServerMenu } from "@shared/agent-server";
import { CollaboratorStack } from "@shared/collaborators";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { Button } from "@shared/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { useDesignEngine } from "../../design-engine-context";
import { DESIGN_LAYOUT } from "../../design-layout";
import { designEditor } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { PropertySections } from "./property-sections";

/**
 * The right panel: history, agents, export and the button that hides it, then the Design/Prototype
 * tabs and the zoom, or the active tool's sidebar (`toolSidebars`).
 */
export function PropertiesPanel() {
  const engine = useDesignEngine();
  const agentsEnabled = useAgentServerStore((state) => state.enabled);
  const tab = useDesignPanelStore((state) => state.propertiesTab);
  const setTab = useDesignPanelStore((state) => state.setPropertiesTab);
  const setOpen = useDesignPanelStore((state) => state.setRightOpen);
  const { host } = useEditorModules();
  const tool = useEngineState((state) => state.tool);
  // The active tool's sidebar (e.g. the frame presets) replaces the sections while it's on.
  const ToolSidebar = host.find(designEditor.toolSidebars, tool)?.component;

  return (
    <aside
      aria-label="Properties"
      className="flex shrink-0 flex-col border-l bg-surface"
      style={{ width: DESIGN_LAYOUT.rightPanel }}
    >
      <header className="flex h-12 items-center gap-0.5 border-b px-2">
        <HistoryControls />
        <AgentServerMenu
          followable
          agentActions={(agent) => <CollaboratorUndoButton collaborator={agent} />}
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
        <CollaboratorStack followable className="ml-0.5" />
        <div className="flex-1" />
        <Button size="sm" onClick={() => engine.commands.export?.()}>
          <Download />
          Export
        </Button>
        <ToolButton label="Hide properties panel" side="bottom" onClick={() => setOpen(false)}>
          <PanelRightClose />
        </ToolButton>
      </header>

      {ToolSidebar ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ToolSidebar />
        </div>
      ) : (
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
      )}
    </aside>
  );
}
