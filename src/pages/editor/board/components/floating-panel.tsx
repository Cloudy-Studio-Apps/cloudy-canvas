import type { ComponentProps } from "react";

import { Separator } from "@ui/components/ui/separator";
import { cn } from "@ui/lib/utils";

/** Surface for chrome that floats over the canvas. */
export function FloatingPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-surface p-1 shadow-lifted",
        className,
      )}
      {...props}
    />
  );
}

/** Vertical divider between groups inside a FloatingPanel. */
export function PanelDivider({ className }: { className?: string }) {
  return <Separator orientation="vertical" className={cn("mx-1 h-6!", className)} />;
}
