import { cn } from "@shared/ui/lib/utils";
import type { PropertyGridProps } from "./property-grid.types";

/** Fields two per row. */
export function PropertyGrid({ children, className }: PropertyGridProps) {
  return <div className={cn("grid grid-cols-2 gap-2", className)}>{children}</div>;
}
