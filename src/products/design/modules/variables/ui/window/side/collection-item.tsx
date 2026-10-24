import { useState } from "react";

import { CommitInput } from "@canvas-ui";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/components/ui/context-menu";
import { cn } from "@shared/ui/lib/utils";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { GroupOutline } from "./group-outline";
import type { CollectionItemProps } from "./side.types";

/**
 * A collection in the left column: click shows it, double-click or right-click → Rename edits its
 * name in place, right-click → Delete asks first; the open one unfolds into its groups.
 */
export function CollectionItem({ collection, onDelete }: CollectionItemProps) {
  const { tokens, store, collection: shown } = useBoard();
  const showCollection = useVariablesWindowStore((state) => state.showCollection);
  const [renaming, setRenaming] = useState(false);
  const open = collection.id === shown?.id;
  return (
    <div>
      {renaming ? (
        <CommitInput
          autoFocus
          aria-label="Collection name"
          value={collection.name}
          onCommit={(name) => tokens.renameCollection(collection.id, name)}
          onBlur={() => setRenaming(false)}
          className="h-7 text-xs"
        />
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button
              type="button"
              onClick={() => showCollection(collection.id)}
              onDoubleClick={() => setRenaming(true)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                open && "bg-primary/10 font-medium",
              )}
            >
              <span className="truncate">{collection.name}</span>
              <span className="font-normal text-subtle-foreground">
                {store.variables(collection.id).length}
              </span>
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent
            // Don't hand focus back to the row: it would take it from the rename field.
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <ContextMenuItem onSelect={() => setRenaming(true)}>Rename</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive" onSelect={() => onDelete(collection)}>
              Delete collection
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
      {open && <GroupOutline collection={collection} />}
    </div>
  );
}
