import { cn } from "@shared/ui/kit";
import type { SpreadHeadingRowProps } from "./brochure-page-row.types";
import { INDENT_PX } from "./page-list.constants";
import { RepeatBracket } from "./repeat-bracket";

/**
 * A book spread's heading in the page list ("Pages 2–3", "Back cover"): a quiet rule between
 * spreads, under the section folders, that takes drops.
 */
export function SpreadHeadingRow({
  label,
  rowDrag,
  dropId,
  depth,
  bracket,
}: SpreadHeadingRowProps) {
  const over = rowDrag.drag?.overId === dropId;
  return (
    <li
      {...rowDrag.dropProps(dropId)}
      style={{ paddingLeft: 4 + depth * INDENT_PX }}
      className={cn(
        "relative flex items-center gap-1.5 rounded-sm pt-1.5 pr-1 pb-0.5 text-[10px] text-subtle-foreground",
        over && "bg-primary-soft text-primary-soft-foreground",
      )}
    >
      <RepeatBracket depth={bracket} />
      <span className="shrink-0 tabular-nums">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </li>
  );
}
