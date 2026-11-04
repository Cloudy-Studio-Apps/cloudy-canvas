import { cn } from "@shared/ui/kit";
import type { SpreadHeadingRowProps } from "./brochure-page-row.types";

/** A book spread's heading in the page list ("Pages 2–3", "Back cover"), which takes drops. */
export function SpreadHeadingRow({ label, rowDrag, dropId }: SpreadHeadingRowProps) {
  const over = rowDrag.drag?.overId === dropId;
  return (
    <li
      {...rowDrag.dropProps(dropId)}
      className={cn(
        "rounded-sm px-1 pt-2 pb-0.5 text-[10px] font-medium tracking-wide text-subtle-foreground uppercase",
        over && "bg-primary-soft text-primary-soft-foreground",
      )}
    >
      {label}
    </li>
  );
}
