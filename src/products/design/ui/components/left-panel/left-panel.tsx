import { ChevronDown } from "lucide-react";

import { DocumentInfoPopover, SaveIndicator, useCanvasFile, useEditorModules } from "@canvas-ui";
import { Badge } from "@shared/ui/components/ui/badge";
import { DESIGN_LAYOUT } from "../../design-layout";
import { designEditor } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";

/** The left panel: the file's name and state, then the tab picked in the rail. */
export function LeftPanel() {
  const { host } = useEditorModules();
  const file = useCanvasFile();
  const tabs = [...host.get(designEditor.leftTabs)].sort((a, b) => a.order - b.order);
  const active = useDesignPanelStore((state) => state.leftTab);
  // A tab that's gone (a plugin was removed) falls back to the first one.
  const tab = tabs.find((item) => item.id === active) ?? tabs[0];

  return (
    <aside
      aria-label={tab?.label}
      className="flex shrink-0 flex-col border-r bg-surface"
      style={{ width: DESIGN_LAYOUT.leftPanel }}
    >
      <header className="border-b px-3 py-2.5">
        <div className="flex items-center gap-1">
          <DocumentInfoPopover className="-ml-1 max-w-none font-semibold">
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </DocumentInfoPopover>
          <SaveIndicator />
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{file.draft ? "Draft" : file.path ? "Saved file" : "Not saved yet"}</span>
          <Badge variant="design">Design</Badge>
        </div>
      </header>
      {tab && <tab.component />}
    </aside>
  );
}
