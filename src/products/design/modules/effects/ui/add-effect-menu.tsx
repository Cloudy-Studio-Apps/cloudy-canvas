import { Fragment } from "react";

import { ExtensionIconView } from "@canvas-ui";
import { PanelAddButton } from "@design/ui/components/panel";
import { Badge } from "@shared/ui/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import type { AddEffectMenuProps } from "./effects-ui.types";

/** The Effects section's "+": every effect type, as Figma lists them, Beta ones tagged. */
export function AddEffectMenu({ types, onAdd }: AddEffectMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <PanelAddButton label="Add effect" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {types.map((entry) => (
          <Fragment key={entry.type}>
            {entry.separated && <DropdownMenuSeparator />}
            <DropdownMenuItem className="gap-2 text-xs" onSelect={() => onAdd(entry)}>
              <ExtensionIconView icon={entry.icon} className="size-3.5" />
              {entry.label}
              {entry.beta && <Badge className="ml-auto h-4 px-1 text-[10px]">Beta</Badge>}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
