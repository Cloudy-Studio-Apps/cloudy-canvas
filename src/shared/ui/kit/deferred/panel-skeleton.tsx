import { cn } from "@shared/ui/lib/utils";

import type { PanelSkeletonProps } from "./deferred.types";

/** Grey placeholder rows for a panel still being drawn (`Deferred`'s `fallback`). */
export function PanelSkeleton({ rows = 6, className }: PanelSkeletonProps) {
  return (
    <div aria-busy className={cn("flex flex-col gap-2 p-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-8 animate-pulse rounded-md bg-surface-sunken" />
      ))}
    </div>
  );
}
