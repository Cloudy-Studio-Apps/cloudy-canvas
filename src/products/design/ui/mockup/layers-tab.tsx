import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { LayerRow } from "./layer-row";
import type { LayersTabProps } from "./left-panel.types";
import { MOCK_LAYERS, MOCK_PAGES } from "./mock-data";
import { PanelIconButton, PanelSection } from "./panel-section";

/** The left panel's Layers tab: the current page's layers, and the pages below. */
export function LayersTab({ selectedId, onSelect }: LayersTabProps) {
  const [page, setPage] = useState(MOCK_PAGES[1]);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-10 shrink-0 items-center justify-between px-3">
          <h2 className="text-xs font-semibold text-foreground">Layers</h2>
          <PanelIconButton label="Search layers">
            <Search />
          </PanelIconButton>
        </header>
        <ul role="tree" className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
          {MOCK_LAYERS.map((layer) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </div>

      <PanelSection
        title="Pages"
        className="shrink-0 border-t border-b-0"
        actions={
          <PanelIconButton label="Add page">
            <Plus />
          </PanelIconButton>
        }
      >
        <ul className="flex flex-col gap-px">
          {MOCK_PAGES.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => setPage(name)}
                className={cn(
                  "flex h-7 w-full cursor-pointer items-center rounded-sm px-2 text-left text-sm text-foreground hover:bg-hover",
                  page === name && "bg-muted font-medium",
                )}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </PanelSection>
    </>
  );
}
