import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { LayerTree } from "@design";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { LayerRow } from "./layer-row";
import { LayersSearch } from "./layers-search";
import { matchingLayers } from "./matching-layers";
import { PagesSection } from "./pages-section";
import { revealedLayers } from "./revealed-layers";
import { useLayerTree } from "./use-layer-tree";

/** Search results show without their children. */
const FLAT: LayerTree = new Map();

/** The left panel's Layers tab: the page's layer tree (topmost first), searchable by name, then
 * the pages. */
export function LayersTab() {
  const engine = useDesignEngine();
  const tree = useLayerTree();
  const selectedIds = useDesignState((state) => state.selectedIds);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  // The selection's ancestors open, so a layer picked on the canvas shows in the tree.
  const revealed = useMemo(() => revealedLayers(tree, selectedIds), [tree, selectedIds]);
  const [search, setSearch] = useState<string | null>(null);
  const searching = search !== null && search.trim() !== "";
  // While searching, the matches show as a flat list.
  const roots = searching ? matchingLayers(tree, search, engine.kinds) : (tree.get(null) ?? []);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-10 shrink-0 items-center justify-between gap-1 px-3">
          {search === null ? (
            <>
              <h2 className="text-xs font-semibold text-foreground">Layers</h2>
              <PanelIconButton label="Search layers" onClick={() => setSearch("")}>
                <Search />
              </PanelIconButton>
            </>
          ) : (
            <LayersSearch
              query={search}
              onQueryChange={setSearch}
              onClose={() => setSearch(null)}
            />
          )}
        </header>
        {roots.length === 0 ? (
          <p className="px-3 text-xs text-muted-foreground">
            {searching
              ? "No layer has that name."
              : "Draw a frame (F), a shape (R) or text (T) to add a layer."}
          </p>
        ) : (
          <ul
            role="tree"
            aria-label="Layers"
            className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3"
          >
            {roots.map((node) => (
              <LayerRow
                key={node.id}
                node={node}
                tree={searching ? FLAT : tree}
                depth={0}
                selected={selected}
                revealed={revealed}
              />
            ))}
          </ul>
        )}
      </div>
      <PagesSection />
    </>
  );
}
