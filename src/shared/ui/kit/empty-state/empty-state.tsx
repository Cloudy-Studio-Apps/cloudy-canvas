import { cn } from "@shared/ui/lib/utils";
import type { EmptyStateProps } from "./empty-state.types";

/** What a list or panel shows when there's nothing in it yet. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 px-4 py-6 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {icon && <span className="mb-1 text-subtle-foreground [&_svg]:size-6">{icon}</span>}
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="max-w-64 text-xs">{description}</p>}
      {action && <div className="mt-2 flex gap-2">{action}</div>}
    </div>
  );
}
