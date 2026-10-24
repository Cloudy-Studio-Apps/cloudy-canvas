import { cn } from "@shared/ui/lib/utils";
import { useFrameThumbnail } from "../hooks/use-frame-thumbnail";
import type { PageThumbnailProps } from "./brochure-page-row.types";

/** A page frame's small picture, a blank tile until it's drawn. */
export function PageThumbnail({ frameId, className }: PageThumbnailProps) {
  const url = useFrameThumbnail(frameId);
  return (
    <span
      className={cn(
        "block shrink-0 overflow-hidden rounded-xs border bg-surface-sunken",
        className,
      )}
    >
      {url && <img src={url} alt="" className="size-full object-cover" draggable={false} />}
    </span>
  );
}
