import { rowDropLine } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import type { ListEndDropProps } from "./brochure-page-row.types";
import { dropId } from "./drop-position";

const END = dropId({ kind: "end" });

/** The space after the page list's last row: a page dropped there goes last. */
export function ListEndDrop({ rowDrag }: ListEndDropProps) {
  const over = rowDrag.drag?.overId === END;
  return (
    <li
      aria-hidden
      {...rowDrag.dropProps(END)}
      className={cn("relative min-h-6 flex-1", rowDropLine(over ? "before" : null))}
    />
  );
}
