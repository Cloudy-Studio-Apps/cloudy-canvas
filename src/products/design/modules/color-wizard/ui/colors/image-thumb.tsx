import { useAssetUrl } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import type { ImageThumbProps } from "./colors.types";

/** One of the file's images as a square to pick. */
export function ImageThumb({ image, selected, onPick }: ImageThumbProps) {
  const url = useAssetUrl(image.assetId);
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a picture tile, the whole tile picks it
    <button
      type="button"
      title={image.name}
      onClick={onPick}
      className={cn(
        "relative aspect-square cursor-pointer overflow-hidden rounded-md border border-border bg-surface-sunken",
        selected && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
      )}
    >
      {url && <img src={url} alt="" className="size-full object-cover" />}
      <span className="absolute inset-x-0 bottom-0 truncate bg-overlay px-1 py-0.5 text-left text-[10px] text-background">
        {image.name}
      </span>
    </button>
  );
}
