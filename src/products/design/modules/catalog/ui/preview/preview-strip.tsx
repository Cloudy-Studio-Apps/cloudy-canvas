import { ElementThumbnail } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import type { PreviewStripProps } from "./preview.types";

/** Every page small along the bottom of the preview; a click turns to it. */
export function PreviewStrip({ pages, shown, onPick }: PreviewStripProps) {
  return (
    <div className="flex max-w-[90vw] gap-1 overflow-x-auto p-1">
      {pages.map((page) => (
        // eslint-disable-next-line no-restricted-syntax -- bespoke: a page thumbnail in the preview strip
        <button
          key={page.slot.id}
          type="button"
          aria-label={page.frame.name}
          onClick={() => onPick(page.slot.id)}
          className={cn(
            "shrink-0 cursor-pointer opacity-50 outline-2 outline-transparent hover:opacity-80",
            shown.has(page.slot.id) && "opacity-100 outline-ring",
          )}
        >
          <ElementThumbnail id={page.frame.id} className="h-10 w-14" />
        </button>
      ))}
    </div>
  );
}
