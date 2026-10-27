import { X } from "lucide-react";

import { PanelIconButton } from "@design/ui/components/panel";
import { SearchInput } from "@shared/ui/kit";
import type { LayersSearchProps } from "./layers-search.types";
import { t } from "../layers.i18n";

/** The search box that replaces the Layers heading while searching (Escape closes it). */
export function LayersSearch({ query, onQueryChange, onClose }: LayersSearchProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <SearchInput
        size="sm"
        aria-label={t("search.label")}
        placeholder={t("search.label")}
        autoFocus
        value={query}
        onChange={onQueryChange}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Escape") onClose();
        }}
        className="flex-1 text-xs"
      />
      <PanelIconButton label={t("search.close")} onClick={onClose}>
        <X />
      </PanelIconButton>
    </div>
  );
}
