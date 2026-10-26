import { Plus } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { insertColor } from "../store";
import type { InsertSeamProps } from "./colors.types";

/**
 * The "+" on the seam between two colors: a strip straddling the swatch's left edge whose button
 * shows on hover and adds the color halfway between them.
 */
export function InsertSeam({ at }: InsertSeamProps) {
  return (
    <div className="group/seam absolute inset-y-0 -left-3.5 z-10 flex w-7 items-center justify-center @max-[420px]:inset-x-0 @max-[420px]:-top-3 @max-[420px]:bottom-auto @max-[420px]:h-6 @max-[420px]:w-auto">
      <IconButton
        label="Add a color between these"
        size="sm"
        variant="outline"
        className="scale-90 bg-surface text-foreground opacity-0 shadow-popover transition group-hover/seam:scale-100 group-hover/seam:opacity-100 focus-visible:opacity-100"
        onClick={() => insertColor(at)}
      >
        <Plus />
      </IconButton>
    </div>
  );
}
