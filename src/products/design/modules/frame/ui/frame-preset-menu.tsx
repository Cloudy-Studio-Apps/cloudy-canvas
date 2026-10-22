import { Fragment } from "react";

import { FRAME_PRESETS } from "@design";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import type { FramePresetMenuProps } from "./frame-preset-menu.types";

const GROUPS = [...new Set(FRAME_PRESETS.map((preset) => preset.group))];

/** The frame sizes, by group (Desktop, Phone, …). */
export function FramePresetMenu({ trigger, onPick }: FramePresetMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {GROUPS.map((group, i) => (
          <Fragment key={group}>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group}</DropdownMenuLabel>
            {FRAME_PRESETS.filter((preset) => preset.group === group).map((preset) => (
              <DropdownMenuItem key={preset.id} onSelect={() => onPick(preset)}>
                {preset.label}
                <DropdownMenuShortcut>
                  {preset.size.w}×{preset.size.h}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
