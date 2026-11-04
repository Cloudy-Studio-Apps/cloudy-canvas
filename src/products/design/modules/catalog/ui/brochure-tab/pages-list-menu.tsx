import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import type { PagesListMenuProps } from "./add-page-menu.types";

/**
 * The right-click menu of the page list, off its pages: what the "+" adds (a page's own menu
 * opens on a page instead).
 */
export function PagesListMenu({ entries, children }: PagesListMenuProps) {
  if (entries.length === 0) return children;
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {entries.map(({ id, label, icon: Icon, run }) => (
          <ContextMenuItem key={id} className="gap-2 text-xs" onSelect={run}>
            <Icon className="size-3.5" />
            {label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
