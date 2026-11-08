import { groupBySource, TokenSourceHeader, useDocumentTokens, useTokenSources } from "@canvas-ui";
import { SidebarCollection } from "./sidebar-collection";
import type { SidebarGroupsProps } from "./variables-ui.types";

/**
 * The file's variables in the properties panel: each collection's groups (a caption per
 * collection when there are several). In a file using project libraries, grouped by where they
 * come from: each library (its note says edits reach every file), then the file's own.
 */
export function SidebarGroups(props: SidebarGroupsProps) {
  const { store } = useDocumentTokens();
  const collections = store.collections().filter((c) => store.variables(c.id).length > 0);
  const sources = useTokenSources(collections);
  if (!sources) {
    return (
      <div className="flex flex-col gap-1.5">
        {collections.map((collection) => (
          <SidebarCollection
            key={collection.id}
            collection={collection}
            caption={collections.length > 1}
            {...props}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {groupBySource(collections, sources).map(({ source, items }) => (
        <div key={source.libraryId ?? "file"} className="flex flex-col gap-1.5">
          <TokenSourceHeader source={source} />
          {items.map((collection) => (
            <SidebarCollection
              key={collection.id}
              collection={collection}
              caption
              source={source}
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
