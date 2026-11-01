import { X } from "lucide-react";

import { ElementThumbnail, rowDropLine } from "@canvas-ui";
import { paperSize } from "../../model/paper-size";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { optionLetter } from "../option-letter";
import { showPage } from "../page-actions";
import { BrochureOptionsList } from "./brochure-options-list";
import type { BrochurePageRowProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/**
 * One brochure page: its number, picture, frame and options. A click shows it; rows drag to
 * reorder (`rowDrag`, owned by the list); × takes it out of the brochure. The selected page lists its options to pick from.
 */
export function BrochurePageRow({ page, label, selected, rowDrag }: BrochurePageRowProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const { drag } = rowDrag;
  const chosen = page.options.findIndex((option) => option.id === page.frame.id);
  const paper = paperSize(page.frame);
  const detail =
    page.options.length > 1
      ? t("tab.page.options", {
          count: page.options.length,
          letter: optionLetter(chosen),
        })
      : (paper.name ?? `${paper.width} × ${paper.height} mm`);

  return (
    <li>
      <div
        {...rowDrag.grabProps(page.slot.id)}
        {...rowDrag.dropProps(page.slot.id)}
        onClick={() => showPage(engine, page.frame)}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "group relative flex cursor-default items-center gap-2 rounded-sm px-1 py-1 hover:bg-hover",
          selected && "bg-primary-soft hover:bg-primary-soft",
          rowDropLine(drag?.overId === page.slot.id ? drag.side : null),
          drag?.id === page.slot.id && "opacity-50",
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
            label={t("tab.page.remove")}
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
