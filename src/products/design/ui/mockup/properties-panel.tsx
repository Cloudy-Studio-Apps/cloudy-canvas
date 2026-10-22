import { Bot, ChevronDown, Play } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { AgentServerMenu } from "@shared/agent-server";
import { Button } from "@shared/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { FrameProperties } from "./frame-properties";
import { PageProperties } from "./page-properties";
import { PrototypeProperties } from "./prototype-properties";
import type { PropertiesPanelProps } from "./properties-panel.types";

/** The right panel: file actions, the Design/Prototype tabs and the selection's properties. */
export function PropertiesPanel({ frame }: PropertiesPanelProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-l bg-surface">
      <header className="flex h-12 items-center gap-1 border-b px-2">
        <AgentServerMenu
          trigger={
            <ToolButton label="Agents" side="bottom">
              <Bot />
            </ToolButton>
          }
        />
        <div className="flex-1" />
        <ToolButton label="Present" side="bottom">
          <Play />
        </ToolButton>
        <Button size="sm">Share</Button>
      </header>

      <Tabs defaultValue="design" className="min-h-0 flex-1 gap-0">
        <div className="flex h-11 items-center justify-between border-b px-2">
          <TabsList className="h-7">
            <TabsTrigger value="design" className="px-2.5 text-xs">
              Design
            </TabsTrigger>
            <TabsTrigger value="prototype" className="px-2.5 text-xs">
              Prototype
            </TabsTrigger>
          </TabsList>
          <button
            type="button"
            className="flex h-7 cursor-pointer items-center gap-1 rounded-sm px-1.5 text-xs text-muted-foreground tabular-nums hover:bg-hover hover:text-foreground"
          >
            25%
            <ChevronDown className="size-3" />
          </button>
        </div>

        <TabsContent value="design" className="min-h-0 overflow-y-auto">
          {frame ? <FrameProperties frame={frame} /> : <PageProperties />}
        </TabsContent>
        <TabsContent value="prototype" className="min-h-0 overflow-y-auto">
          <PrototypeProperties frame={frame} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
