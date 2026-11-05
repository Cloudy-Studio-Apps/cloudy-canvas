import type { PendingPagesRowProps } from "./pending-pages-row.types";
import { RepeatBracket } from "./repeat-bracket";
import { INDENT_PX } from "./page-list.constants";
import { t } from "../../catalog.i18n";

/**
 * A repeat run's pages that aren't made yet, as one row ("+36 pages at export"): they're counted in
 * the numbers and the contents, but never selected, dragged or dropped on.
 */
export function PendingPagesRow({ count, depth, bracket }: PendingPagesRowProps) {
  return (
    <li
      title={t("repeat.pendingHint")}
      style={{ paddingLeft: 4 + depth * INDENT_PX }}
      className="relative flex items-center gap-2 rounded-sm px-1 py-1 text-xs text-subtle-foreground"
    >
      <RepeatBracket depth={bracket} />
      <span className="w-5 shrink-0" />
      <span className="h-6 w-14 shrink-0 rounded-xs border border-dashed border-border-strong bg-surface" />
      <span className="min-w-0 flex-1 truncate text-muted-foreground italic">
        {t("repeat.pending", { count })}
      </span>
    </li>
  );
}
