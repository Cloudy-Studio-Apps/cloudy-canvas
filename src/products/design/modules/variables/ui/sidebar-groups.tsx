import { useDocumentTokens } from "@canvas-ui";
import { SidebarGroupRow } from "./sidebar-group-row";
import { variablesByGroup } from "./window/group-paths";
import type { SidebarGroupsProps } from "./variables-ui.types";

/** The file's variables in the properties panel: each collection's groups (a caption per collection when there are several). */
export function SidebarGroups(props: SidebarGroupsProps) {
  const { store } = useDocumentTokens();
  const collections = store.collections().filter((c) => store.variables(c.id).length > 0);
  return (
    <div className="flex flex-col gap-1.5">
      {collections.map((collection) => (
        <div key={collection.id} className="flex flex-col">
          {collections.length > 1 && (
            <p className="px-1 pt-1 pb-0.5 text-[11px] text-subtle-foreground">{collection.name}</p>
          )}
          {[...variablesByGroup(store.variables(collection.id))].map(([group, items]) => (
            <SidebarGroupRow
              key={group}
              collectionId={collection.id}
              group={group}
              items={items}
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
