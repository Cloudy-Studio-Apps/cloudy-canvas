import { KeyRound } from "lucide-react";

import { cn } from "@shared/ui/kit";
import type { TableCardProps, TableCardRowProps } from "./table-card.types";

const ROW = "flex h-6 w-full min-w-0 items-center gap-1 px-1.5 font-mono text-[11px]";

/** A table as a small card: its name and rows, with keys marked and new rows highlighted. */
export function TableCard({ title, rows, color, fresh, className }: TableCardProps) {
  return (
    <div
      className={cn(
        "relative z-10 min-w-0 overflow-hidden rounded-sm border bg-surface-sunken",
        fresh && "border-primary",
        className,
      )}
      style={color ? { borderColor: color } : undefined}
    >
      <div className="truncate border-b px-1.5 py-1 text-center text-xs font-semibold">{title}</div>
      {rows.map((row) => (
        <Row key={row.id} row={row} />
      ))}
    </div>
  );
}

function Row({ row }: TableCardRowProps) {
  const body = (
    <>
      <span className="flex w-3 shrink-0 [&_svg]:size-3">
        {row.key && (
          <KeyRound className={row.key === "own" ? "text-warning" : "text-primary"} aria-hidden />
        )}
      </span>
      <span className={cn("truncate", row.gone && "line-through opacity-60")}>{row.name}</span>
      {row.tag && <span className="ml-auto shrink-0 pl-1 text-[10px] opacity-80">{row.tag}</span>}
    </>
  );
  const tone = cn(
    row.picked && "bg-primary text-primary-foreground [&_svg]:text-primary-foreground",
    !row.picked && row.fresh && "bg-primary-soft font-semibold text-primary-soft-foreground",
    !row.picked && !row.fresh && "text-muted-foreground",
  );
  if (!row.onPick) {
    return (
      <div data-row={row.id} title={row.title} className={cn(ROW, tone)}>
        {body}
      </div>
    );
  }
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a table row picked in a picture
    <button
      type="button"
      data-row={row.id}
      aria-pressed={row.picked ?? false}
      aria-disabled={row.disabled}
      title={row.title}
      className={cn(
        ROW,
        tone,
        "cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
        !row.picked && "text-foreground hover:bg-hover",
        row.disabled && "cursor-not-allowed hover:bg-transparent",
      )}
      onClick={row.disabled ? undefined : row.onPick}
    >
      {body}
    </button>
  );
}
