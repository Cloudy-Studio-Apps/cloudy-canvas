import { useState } from "react";

import { CommitInput, LibraryBadge } from "@canvas-ui";
import { tCommon } from "@shared/core";
import {
  cn,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useMoveToLibrary } from "../../use-move-to-library";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { GroupOutline } from "./group-outline";
import type { CollectionItemProps } from "./side.types";
import { t } from "../../../variables.i18n";

/**
 * A collection in the left column: click shows it, double-click or right-click → Rename edits its
 * name in place, right-click → Delete asks first, and the file's own move to a library from there
 * too; the open one unfolds into its groups. A library's collection carries its badge, and can't
 * be renamed or deleted while the library can't be edited.
 */
export function CollectionItem({ collection, onDelete, source }: CollectionItemProps) {
  const { tokens, store, collection: shown } = useBoard();
  const showCollection = useVariablesWindowStore((state) => state.showCollection);
  const [renaming, setRenaming] = useState(false);
  const { targets, dialog } = useMoveToLibrary([collection.id]);
  const open = collection.id === shown?.id;
  const editable = source?.editable !== false;
  const row = (
    <button
      type="button"
      onClick={() => showCollection(collection.id)}
      onDoubleClick={editable ? () => setRenaming(true) : undefined}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
        open && "bg-primary/10 font-medium",
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{collection.name}</span>
        {source?.libraryId && <LibraryBadge name={source.name} />}
      </span>
      <span className="font-normal text-subtle-foreground">
        {store.variables(collection.id).length}
      </span>
    </button>
  );
  return (
    <div>
      {renaming ? (
        <CommitInput
          autoFocus
          aria-label={t("side.collectionName")}
          value={collection.name}
          onCommit={(name) => tokens.renameCollection(collection.id, name)}
          onBlur={() => setRenaming(false)}
          className="h-7 text-xs"
        />
      ) : !editable ? (
        row
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
          <ContextMenuContent
            // Don't hand focus back to the row: it would take it from the rename field.
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <ContextMenuItem onSelect={() => setRenaming(true)}>
              {tCommon("rename")}
            </ContextMenuItem>
            {targets.map((target) => (
              <ContextMenuItem key={target.id} onSelect={target.select}>
                {target.label}
              </ContextMenuItem>
            ))}
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive" onSelect={() => onDelete(collection)}>
              {t("side.deleteCollection")}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
      {open && <GroupOutline collection={collection} />}
      {dialog}
    </div>
  );
}
