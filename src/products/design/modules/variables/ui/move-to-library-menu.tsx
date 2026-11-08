import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useMoveToLibrary } from "./use-move-to-library";
import type { MoveToLibraryMenuProps } from "./variables-ui.types";

/**
 * Right-click → Move to a library, on the file's own variables, collections and styles `ids`
 * (`useMoveToLibrary`). Library items, and files without libraries, get no menu.
 */
export function MoveToLibraryMenu({ ids, children }: MoveToLibraryMenuProps) {
  const { targets, dialog } = useMoveToLibrary(ids);
  if (targets.length === 0) return children;
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {targets.map((target) => (
            <ContextMenuItem key={target.id} onSelect={target.select}>
              {target.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
      {dialog}
    </>
  );
}
