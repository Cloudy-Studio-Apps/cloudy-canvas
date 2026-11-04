import { PanelAddButton } from "@design/ui/components/panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { SourceIcon } from "../source-icon";
import type { AddSourceMenuProps } from "./add-source-menu.types";
import { t } from "../../data.i18n";

/** "+ Add source": one item per source type (a file, a link, and what plugins add). */
export function AddSourceMenu({ types, onPick }: AddSourceMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <PanelAddButton label={t("tab.add")} />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {types.map((type) => {
          return (
            <DropdownMenuItem
              key={type.id}
              className="gap-2 text-xs"
              onSelect={() => onPick(type.id)}
            >
              <SourceIcon name={type.icon} className="size-3.5" />
              {type.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
