import { useState } from "react";
import { FileWarning } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import type { MissingFilePopoverProps } from "./missing-file-popover.types";

/** Opened by clicking a missing file's card: says where it was and offers to locate or forget it. */
export function MissingFilePopover({ file, actions, children }: MissingFilePopoverProps) {
  const [open, setOpen] = useState(false);
  const buttons = actions.filter((action) => action.id === "locate" || action.id === "forget");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 space-y-3">
        <div className="flex gap-2.5">
          <FileWarning className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">“{file.name}” was moved or deleted</p>
            <p className="text-xs break-all text-muted-foreground">It was at {file.path}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {buttons.map(({ id, label, icon: Icon, run, destructive }) => (
            <Button
              key={id}
              size="sm"
              variant={destructive ? "ghost" : "outline"}
              onClick={() => {
                setOpen(false);
                run();
              }}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
