import { SlidersHorizontal } from "lucide-react";

import { Badge } from "@shared/ui/components/ui/badge";
import { PanelAddButton, PanelIconButton, PanelSection } from "./panel-section";
import { ColorField } from "./property-field";

/** What the right panel shows when nothing is selected: the page itself. */
export function PageProperties() {
  return (
    <>
      <PanelSection title="Page">
        <ColorField color="#F1F3F6" opacity={100} label="Page background" />
      </PanelSection>
      <PanelSection title="Styles" actions={<PanelAddButton label="Add style" />} />
      <PanelSection title="Export" actions={<PanelAddButton label="Add export setting" />} />
      <PanelSection
        title="Agents"
        actions={
          <PanelIconButton label="Agent settings">
            <SlidersHorizontal />
          </PanelIconButton>
        }
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          MCP server on
          <Badge variant="outline">1 connection</Badge>
        </div>
      </PanelSection>
    </>
  );
}
