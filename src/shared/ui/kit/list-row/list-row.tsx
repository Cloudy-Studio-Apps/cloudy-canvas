import { cn } from "@shared/ui/lib/utils";
import type { ListRowProps } from "./list-row.types";

/** A row of a list or tree: icon, label, muted meta and actions on hover. */
export function ListRow({
  icon,
  label,
  meta,
  actions,
  selected,
  onSelect,
  depth = 0,
  muted,
  size = "sm",
  className,
  style,
  onKeyDown,
  ...props
}: ListRowProps) {
  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
        onKeyDown?.(event);
      }}
      style={{ paddingLeft: 8 + depth * 12, ...style }}
      className={cn(
        "group/row flex min-w-0 items-center gap-2 rounded-sm pr-1 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        size === "sm" ? "h-row text-xs" : "min-h-control py-1.5 text-sm",
        onSelect && "cursor-pointer hover:bg-hover",
        selected && "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
        muted && "text-subtle-foreground",
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "flex shrink-0 items-center text-muted-foreground",
            size === "sm" ? "[&_svg]:size-3.5" : "[&_svg]:size-4",
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</span>}
      {actions && (
        <span
          className={cn(
            "flex shrink-0 items-center gap-0.5 opacity-0 group-focus-within/row:opacity-100 group-hover/row:opacity-100",
            selected && "opacity-100",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {actions}
        </span>
      )}
    </div>
  );
}
