import { Separator } from "@shared/ui/components/ui/separator";
import { cn } from "@shared/ui/lib/utils";
import type { FloatingPanelProps, PanelDividerProps } from "./floating-panel.types";

/** On a phone a long bar stays inside the screen and its items scroll under the finger. */
const SCROLLS_ON_PHONES =
  "max-sm:max-w-full max-sm:overflow-x-auto max-sm:[scrollbar-width:none] max-sm:*:shrink-0";

/** Surface for chrome that floats over the canvas. */
export function FloatingPanel({ className, scrollsOnPhones, ...props }: FloatingPanelProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-surface p-1 shadow-lifted",
        scrollsOnPhones && SCROLLS_ON_PHONES,
        className,
      )}
      {...props}
    />
  );
}

/** Vertical divider between groups inside a FloatingPanel. */
export function PanelDivider({ className }: PanelDividerProps) {
  return <Separator orientation="vertical" className={cn("mx-1 h-6!", className)} />;
}
