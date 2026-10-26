import { useState } from "react";
import { X } from "lucide-react";

import { ElementThumbnail } from "@canvas-ui";
import { paperSize } from "../../model/paper-size";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { optionLetter } from "../option-letter";
import { showPage } from "../page-actions";
import { BrochureOptionsList } from "./brochure-options-list";
import type { BrochurePageRowProps } from "./brochure-page-row.types";

/** The drag data type of a brochure page row. */
const PAGE_DRAG = "application/x-cloudy-brochure-page";

/**
 * One brochure page: its number, picture, frame and options. A click shows it; rows drag to
 * reorder (dropped on the upper half of a row, a page goes before it; on the lower half, after
 * it); × takes it out of the brochure. The selected page lists its options to pick from.
 */
export function BrochurePageRow({
  page,
  label,
  position,
  selected,
  onDropPage,
}: BrochurePageRowProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const [drop, setDrop] = useState<"before" | "after" | null>(null);
  const chosen = page.options.findIndex((option) => option.id === page.frame.id);
  const paper = paperSize(page.frame);
  const detail =
    page.options.length > 1
      ? `${page.options.length} options · ${optionLetter(chosen)} printed`
      : (paper.name ?? `${paper.width} × ${paper.height} mm`);

  return (
    <li>
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(PAGE_DRAG, page.slot.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes(PAGE_DRAG)) return;
          event.preventDefault();
          const box = event.currentTarget.getBoundingClientRect();
          setDrop(event.clientY < box.top + box.height / 2 ? "before" : "after");
        }}
        onDragLeave={() => setDrop(null)}
        onDrop={(event) => {
          const slotId = event.dataTransfer.getData(PAGE_DRAG);
          setDrop(null);
          if (!slotId) return;
          event.preventDefault();
          onDropPage(slotId, drop === "after" ? position + 1 : position);
        }}
        onClick={() => showPage(engine, page.frame)}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "group relative flex cursor-default items-center gap-2 rounded-sm px-1 py-1 hover:bg-hover",
          selected && "bg-primary-soft hover:bg-primary-soft",
          drop === "before" &&
            "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary",
          drop === "after" &&
            "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
        )}
      >
        <span
          className={cn(
            "min-w-5 shrink-0 text-right text-xs font-semibold text-muted-foreground tabular-nums",
            selected && "text-primary-soft-foreground",
          )}
        >
          {label}
        </span>
        <ElementThumbnail id={page.frame.id} className="h-10 w-14" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-foreground">{page.frame.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
        </span>
        {/* Taking a page out doesn't show it too. */}
        <span
          className="opacity-0 group-hover:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <PanelIconButton
            label="Take out of the brochure"
            onClick={() => brochure?.removePages([page.slot.id])}
          >
            <X />
          </PanelIconButton>
        </span>
      </div>
      {selected && page.options.length > 1 && <BrochureOptionsList page={page} />}
    </li>
  );
}
