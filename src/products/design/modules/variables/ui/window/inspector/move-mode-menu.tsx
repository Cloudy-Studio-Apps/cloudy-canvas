import { FolderInput } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { useBoard } from "../use-board";
import type { MoveModeMenuProps } from "./inspector.types";
import { t } from "../../../variables.i18n";

/** A mode's "Move to group" menu: the other groups, or a new group of its own. */
export function MoveModeMenu({ axis, mode, moves }: MoveModeMenuProps) {
  const { store } = useBoard();
  const others = store.axes().filter((other) => other.id !== axis.id);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("inspector.moveToAria", { name: mode.name })}
        title={t("inspector.moveToTitle")}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <FolderInput className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs">
          {t("inspector.moveTo", { name: mode.name })}
        </DropdownMenuLabel>
        {others.map((other) => (
          <DropdownMenuItem key={other.id} onSelect={() => moves.move(mode.id, other.id)}>
            {other.name}
          </DropdownMenuItem>
        ))}
        {others.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem onSelect={() => moves.moveToNewGroup(mode.id)}>
          {t("inspector.newGroup")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
