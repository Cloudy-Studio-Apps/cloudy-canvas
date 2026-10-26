import { Fragment } from "react";

import { FRAME_PRESET_GROUPS } from "../frame-presets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import type { FramePresetPickerProps } from "./frame-preset-picker.types";

/** A menu of the frame sizes, by group (Desktop, Phone, Paper, …), opened by `trigger`. */
export function FramePresetPicker({ trigger, onPick }: FramePresetPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 min-w-52 overflow-y-auto">
        {FRAME_PRESET_GROUPS.map(({ group, presets }, i) => (
          <Fragment key={group}>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group}</DropdownMenuLabel>
            {presets.map((preset) => (
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
