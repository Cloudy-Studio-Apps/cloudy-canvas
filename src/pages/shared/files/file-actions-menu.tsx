import { Fragment } from "react";
import { Ellipsis } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { cn } from "@shared/ui/lib/utils";
import type { FileActionsMenuProps } from "./file-actions-menu.types";

/** The ⋯ button on a file card. It shows on hover or focus, and stays while its menu is open. */
export function FileActionsMenu({ actions, label }: FileActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={cn(
            "size-7 bg-surface/80 opacity-0 backdrop-blur-sm transition-opacity",
            "group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
          )}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map(({ id, label: itemLabel, icon: Icon, run, destructive }) => (
          <Fragment key={id}>
            {destructive && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={run}
              className={destructive ? "text-destructive [&_svg]:text-destructive" : undefined}
            >
              <Icon />
              {itemLabel}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
