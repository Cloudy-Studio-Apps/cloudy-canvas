import { useRef } from "react";

import { useInView } from "@shared/ui/hooks/use-in-view";
import { cn } from "@shared/ui/lib/utils";
import type { ElementThumbnailProps } from "./thumbnails.types";
import { useElementThumbnail } from "./use-element-thumbnail";

/**
 * A top-level element's small picture, a blank tile until it's drawn; drawn only once the tile has
 * come into view, so a long list doesn't draw every one up front.
 */
export function ElementThumbnail({ id, className }: ElementThumbnailProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const url = useElementThumbnail(id, useInView(ref));
  return (
    <span
      ref={ref}
      className={cn(
        "block shrink-0 overflow-hidden rounded-xs border bg-surface-sunken",
        !url && "animate-pulse",
        className,
      )}
    >
      {url && <img src={url} alt="" className="size-full object-cover" draggable={false} />}
    </span>
  );
}
