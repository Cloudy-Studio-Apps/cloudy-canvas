import { Check } from "lucide-react";

import { DropdownMenuShortcut } from "@shared/ui/components/ui/dropdown-menu";
import type { MenuItemContentProps } from "./menu-item-content.types";

/** What goes inside a menu item: its icon, its label, then its shortcut or a tick. */
export function MenuItemContent({ icon, label, shortcut, checked }: MenuItemContentProps) {
  return (
    <>
      {icon ?? <span className="size-4 shrink-0" aria-hidden />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {checked ? (
        <Check className="ml-auto" />
      ) : (
        shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
      )}
    </>
  );
}
