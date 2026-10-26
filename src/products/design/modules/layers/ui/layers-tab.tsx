import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useEditorModules } from "@canvas-ui";
import { siblingMasks } from "../../core";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { LayersList } from "./layers-list";
import { layersTabSections } from "./layers.points";
import { LayersSearch } from "./layers-search";
import { matchingLayers } from "./matching-layers";
import { revealedLayers } from "./revealed-layers";
import { useLayerTree } from "./use-layer-tree";
import { visibleRows } from "./visible-rows";

/**
 * The left panel's Layers tab: the layer tree of the page on screen (topmost first), searchable
 * by name, its rows dragged to rearrange it, then the sections other modules add (the pages).
 */
export function LayersTab() {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const sections = [...host.get(layersTabSections)].sort((a, b) => a.order - b.order);
  const tree = useLayerTree();
  const selectedIds = useDesignState((state) => state.selectedIds);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  // The selection's ancestors open, so a layer picked on the canvas shows in the tree.
  const revealed = useMemo(() => revealedLayers(tree, selectedIds), [tree, selectedIds]);
  const masked = useMemo(() => siblingMasks([...tree.values()].flat()), [tree]);
  const [search, setSearch] = useState<string | null>(null);
  const searching = search !== null && search.trim() !== "";
  // While searching, the matches show as a flat list.
  const roots = useMemo(
    () => (searching ? matchingLayers(tree, search, engine.kinds) : (tree.get(null) ?? [])),
    [searching, tree, search, engine],
  );
  // Layers opened by hand, plus the selection's ancestors.
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set());
  const expanded = useMemo(() => new Set([...opened, ...revealed]), [opened, revealed]);
  const rows = useMemo(
    () => visibleRows(roots, tree, expanded, searching),
    [roots, tree, expanded, searching],
  );
  const toggle = useCallback(
    (id: string) =>
      setOpened((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );
  const expand = useCallback(
    (id: string) => setOpened((current) => (current.has(id) ? current : new Set([...current, id]))),
    [],
  );

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
          <LayersList
            rows={rows}
            tree={tree}
            selected={selected}
            masked={masked}
            onToggle={toggle}
            onExpand={expand}
            draggable={!searching}
          />
        )}
      </div>
      {sections.map((section) => (
        <section.component key={section.id} />
      ))}
    </>
  );
}
