import { Fragment } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/components/ui/context-menu";
import type { FileContextMenuProps } from "./file-context-menu.types";

/** The right-click menu of a file card, with the same actions as its ⋯ menu. */
export function FileContextMenu({ actions, children }: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {actions.map(({ id, label, icon: Icon, run, destructive }) => (
          <Fragment key={id}>
            {destructive && <ContextMenuSeparator />}
            <ContextMenuItem
              onSelect={run}
              className={destructive ? "text-destructive [&_svg]:text-destructive" : undefined}
            >
              <Icon />
              {label}
            </ContextMenuItem>
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
