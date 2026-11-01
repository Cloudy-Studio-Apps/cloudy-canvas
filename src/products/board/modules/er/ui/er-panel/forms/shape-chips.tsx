import { X } from "lucide-react";

import { IconAction } from "./icon-action";
import { ShapeLink } from "./visual";
import type { ShapeChipsProps } from "./shape-chips.types";

/** Entities in a list, as chips: the name selects one and × takes it out. */
export function ShapeChips({ chips }: ShapeChipsProps) {
  return (
    <ul className="grid grid-cols-2 gap-1">
      {chips.map((chip) => (
        <li
          key={chip.id}
          className="flex min-w-0 items-center justify-between gap-1 rounded-sm border-l-[3px] border-l-primary bg-muted pl-2 text-sm font-medium"
        >
          <ShapeLink id={chip.id} label={chip.label} />
          <IconAction label={chip.removeLabel} danger onClick={chip.onRemove}>
            <X />
          </IconAction>
        </li>
      ))}
    </ul>
  );
}
