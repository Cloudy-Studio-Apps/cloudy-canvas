import { MoveToLibraryMenu, useDocumentTokens } from "@canvas-ui";
import { SidebarGroupRow } from "./sidebar-group-row";
import { variablesByGroup } from "./window/group-paths";
import type { SidebarCollectionProps } from "./variables-ui.types";

/** A collection in the properties panel: its name (right-click moves the file's own to a library), then its groups. */
export function SidebarCollection({
  collection,
  caption,
  source,
  ...props
}: SidebarCollectionProps) {
  const { store } = useDocumentTokens();
  return (
    <div className="flex flex-col">
      {caption && (
        <MoveToLibraryMenu ids={[collection.id]}>
          <p className="px-1 pt-1 pb-0.5 text-[11px] text-subtle-foreground">{collection.name}</p>
        </MoveToLibraryMenu>
      )}
      {[...variablesByGroup(store.variables(collection.id))].map(([group, items]) => (
        <SidebarGroupRow
          key={group}
          collectionId={collection.id}
          group={group}
          items={items}
          source={source}
          {...props}
        />
      ))}
    </div>
  );
}
