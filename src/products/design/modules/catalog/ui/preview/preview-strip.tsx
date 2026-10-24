import { cn } from "@shared/ui/lib/utils";
import { PageThumbnail } from "../brochure-tab/page-thumbnail";
import type { PreviewStripProps } from "./preview.types";

/** Every page small along the bottom of the preview; a click turns to it. */
export function PreviewStrip({ pages, shown, onPick }: PreviewStripProps) {
  return (
    <div className="flex max-w-[90vw] gap-1 overflow-x-auto p-1">
      {pages.map((page) => (
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
          <PageThumbnail frameId={page.frame.id} className="h-10 w-14" />
        </button>
      ))}
    </div>
  );
}
