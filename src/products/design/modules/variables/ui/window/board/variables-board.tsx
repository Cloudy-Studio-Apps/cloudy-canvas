import { resolveVariable } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import { leafName, variablesByGroup } from "../group-paths";
import { luminance } from "../luminance";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { BoardToolbar } from "./board-toolbar";
import { EmptyCollection } from "./empty-collection";
import { GroupSection } from "./group-section";
import { NewGroupMenu } from "./new-group-menu";
import { ScalePreviewSection } from "./scale-preview-section";
import { ShadePreviewSection } from "./shade-preview-section";

/**
 * The middle of the window: the collection's groups as card grids (filtered by the search), the
 * generator's preview in its group, and "+ New group". Showing one dark mode turns it dark.
 */
export function VariablesBoard() {
  const { store, collection, modes, shown } = useBoard();
  const { query, draft, scaleDraft, view, select } = useVariablesWindowStore();
  const text = query.trim().toLowerCase();
  const variables = collection
    ? store.variables(collection.id).filter((v) => !text || v.name.toLowerCase().includes(text))
    : [];
  const groups = variablesByGroup(variables);
  const active = draft ?? scaleDraft;
  const previewing =
    active && collection && active.collectionId === collection.id ? active.group : null;
  if (previewing !== null && !groups.has(previewing)) groups.set(previewing, []);
  const surface = store.variables(collection?.id).find((v) => leafName(v) === "surface");
  const surfaceColor =
    surface && view !== "all" ? resolveVariable(store, surface.id, shown[0]?.context ?? {}) : null;
  const dark =
    view !== "all" &&
    modes[0]?.id !== view &&
    surfaceColor?.type === "color" &&
    luminance(surfaceColor.color) < 0.2;

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !active) select(null);
      }}
      className={cn(
        "flex min-h-0 flex-col gap-5 overflow-auto px-4 pt-3.5 pb-6 transition-colors",
        // The app's dark tokens, scoped to the board: the cards show on a dark page.
        dark && "dark bg-surface text-foreground",
      )}
    >
      <BoardToolbar />
      {groups.size === 0 && !text && <EmptyCollection />}
      {groups.size === 0 && text && (
        <p className="text-xs text-muted-foreground">No variables match.</p>
      )}
      {[...groups].map(([group, items]) =>
        group === previewing && scaleDraft ? (
          <ScalePreviewSection key={`scale:${group}`} group={group} rest={items} />
        ) : group === previewing ? (
          <ShadePreviewSection key={`preview:${group}`} group={group} rest={items} />
        ) : items.length > 0 ? (
          <GroupSection key={group} group={group} items={items} />
        ) : null,
      )}
      {groups.size > 0 && <NewGroupMenu />}
    </div>
  );
}
