import { rowDropLine } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import type { BlankPageRowProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/** Why each kind of blank page is there, as its row says. */
const REASONS = {
  "back-cover": t("checks.layout.reasonBack"),
  "spread-start": t("checks.layout.reasonSpread"),
} as const;

/**
 * A blank page the book layout added: shown in its place, never dragged or selected. A page
 * dropped on it takes its place.
 */
export function BlankPageRow({ number, reason, rowDrag, dropId }: BlankPageRowProps) {
  const over = rowDrag.drag?.overId === dropId;
  return (
    <li
      {...rowDrag.dropProps(dropId)}
      className={cn(
        "relative flex items-center gap-2 rounded-sm px-1 py-1 text-xs text-subtle-foreground",
        over && "bg-primary-soft",
        rowDropLine(over ? "before" : null),
      )}
    >
      <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{number}</span>
      <span className="h-10 w-14 shrink-0 rounded-xs border border-dashed border-border-strong bg-surface" />
      <span className="min-w-0 flex-1">
        <span className="block text-muted-foreground italic">{t("tab.blank.title")}</span>
        <span className="block truncate">{t("tab.blank.added", { reason: REASONS[reason] })}</span>
      </span>
    </li>
  );
}
