import { cn } from "@shared/ui/kit";
import type { HotspotsProps } from "./hotspots.types";

/**
 * A screen's hotspots: a box over each layer with interactions, outlined in the primary color
 * while shown. They only draw: the stage hit-tests the pointer itself (`useTriggers`).
 */
export function Hotspots({ rects, shown }: HotspotsProps) {
  return rects.map(({ id, rect }) => (
    <span
      key={id}
      aria-hidden="true"
      className={cn(
        "absolute cursor-pointer rounded-sm",
        shown && "bg-primary/12 outline-2 outline-offset-1 outline-primary",
      )}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    />
  ));
}
