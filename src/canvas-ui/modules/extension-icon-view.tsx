import { cn } from "@shared/ui/lib/utils";
import type { ExtensionIconViewProps } from "./editor-points.types";

/** Draws a module's icon, whether it's a Lucide icon or an SVG document. */
export function ExtensionIconView({ icon, className, strokeWidth }: ExtensionIconViewProps) {
  if ("svg" in icon) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-flex size-4 shrink-0 [&>svg]:size-full", className)}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    );
  }
  const Icon = icon;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
