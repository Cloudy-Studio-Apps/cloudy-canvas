import { PanelAddButton } from "@design/ui/components/panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import type { AddPageMenuProps } from "./add-page-menu.types";
import { t } from "../../catalog.i18n";

/** The page list's "+": the same choices as a right-click on the list (a blank page, a section). */
export function AddPageMenu({ entries }: AddPageMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <PanelAddButton label={t("tab.add.title")} />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {entries.map(({ id, label, icon: Icon, run }) => (
          <DropdownMenuItem key={id} className="gap-2 text-xs" onSelect={run}>
            <Icon className="size-3.5" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
