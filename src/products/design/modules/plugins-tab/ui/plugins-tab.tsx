import { Puzzle } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@shared/ui/components/ui/button";
import { PanelSection } from "@design/ui/components/panel";

/** The left panel's Plugins tab: where design plugins will be run from. */
export function PluginsTab() {
  const navigate = useNavigate();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <PanelSection title="Plugins" className="border-b-0">
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="flex size-9 items-center justify-center rounded-md bg-design-soft text-design-foreground">
            <Puzzle className="size-4" />
          </span>
          <p className="max-w-44 text-xs text-muted-foreground">
            Plugins add element types, tools and panels to designs.
          </p>
          <Button variant="outline" size="sm" onClick={() => void navigate("/settings/plugins")}>
            Manage plugins
          </Button>
        </div>
      </PanelSection>
    </div>
  );
}
