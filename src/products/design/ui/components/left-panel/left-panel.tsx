import { ChevronDown } from "lucide-react";

import { DocumentInfoPopover, SaveIndicator, useCanvasFile } from "@canvas-ui";
import { Badge } from "@shared/ui/components/ui/badge";
import { DESIGN_LAYOUT } from "../../design-layout";
import { useLeftTabs } from "./use-left-tabs";

/** The left panel: the file's name and state, then the tab picked in the rail (for the mode). */
export function LeftPanel() {
  const file = useCanvasFile();
  const { current: tab } = useLeftTabs();

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
