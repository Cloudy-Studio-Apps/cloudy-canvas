import { ChevronDown, PanelLeft } from "lucide-react";

import { Badge } from "@shared/ui/components/ui/badge";
import { AssetsTab } from "./assets-tab";
import { LayersTab } from "./layers-tab";
import type { LeftPanelProps } from "./left-panel.types";
import { PanelIconButton } from "./panel-section";
import { PluginsTab } from "./plugins-tab";

/** The left panel: the file's name, then the tab picked in the rail. */
export function LeftPanel({ tab, fileName, selectedId, onSelect }: LeftPanelProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-surface">
      <header className="border-b px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="-ml-1 flex min-w-0 cursor-pointer items-center gap-1 rounded-sm px-1 py-0.5 text-sm font-semibold text-foreground hover:bg-hover"
          >
            <span className="truncate">{fileName}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
          <PanelIconButton label="Hide panels">
            <PanelLeft />
          </PanelIconButton>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Drafts</span>
          <Badge variant="design">Design</Badge>
        </div>
      </header>

      {tab === "layers" && <LayersTab selectedId={selectedId} onSelect={onSelect} />}
      {tab === "assets" && <AssetsTab />}
      {tab === "plugins" && <PluginsTab />}
    </aside>
  );
}
