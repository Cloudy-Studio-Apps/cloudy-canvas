import { cn } from "@shared/ui/lib/utils";
import type { ElementThumbnailProps } from "./thumbnails.types";
import { useElementThumbnail } from "./use-element-thumbnail";

/** A top-level element's small picture, a blank tile until it's drawn. */
export function ElementThumbnail({ id, className }: ElementThumbnailProps) {
  const url = useElementThumbnail(id);
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
