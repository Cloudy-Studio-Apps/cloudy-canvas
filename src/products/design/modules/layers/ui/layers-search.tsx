import { Search, X } from "lucide-react";

import { PanelIconButton } from "@design/ui/components/panel";
import type { LayersSearchProps } from "./layers-search.types";

/** The search box that replaces the Layers heading while searching (Escape closes it). */
export function LayersSearch({ query, onQueryChange, onClose }: LayersSearchProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <label className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-sm border border-ring bg-surface px-2 text-xs">
        <Search className="size-3.5 shrink-0 text-subtle-foreground" />
        <input
          aria-label="Search layers"
          placeholder="Search layers"
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") onClose();
          }}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle-foreground"
        />
      </label>
      <PanelIconButton label="Close search" onClick={onClose}>
        <X />
      </PanelIconButton>
    </div>
  );
}
