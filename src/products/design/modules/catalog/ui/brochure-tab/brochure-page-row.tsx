import { X } from "lucide-react";

import { ElementThumbnail, rowDropLine } from "@canvas-ui";
import { paperSize } from "../../model/paper-size";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { optionLetter } from "../option-letter";
import { CATALOG_COMMANDS } from "../../mode/catalog-mode.constants";
import { BrochureOptionsList } from "./brochure-options-list";
import { dropId } from "./drop-position";
import { PageRowMenu } from "./page-row-menu";
import { INDENT_PX } from "./section-folder-row";
import type { BrochurePageRowProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/**
 * One brochure page: its number, picture, frame and options. A click selects it (`onClick`, with
 * Ctrl/⌘ and Shift for several, owned by the list); rows drag to reorder (`rowDrag`), several when
 * they're selected; × takes it out of the brochure, and a right-click opens its menu (`PageRowMenu`). The one page selected lists its options.
 */
export function BrochurePageRow({
  page,
  label,
  selected,
  expanded,
  carried,
  onClick,
  rowDrag,
  depth,
}: BrochurePageRowProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const { drag } = rowDrag;
  const target = dropId({ kind: "page", slotId: page.slot.id });
  const up = engine.keymap.label(CATALOG_COMMANDS.movePageUp);
  const down = engine.keymap.label(CATALOG_COMMANDS.movePageDown);
  const hint = up && down ? t("tab.page.moveHint", { up, down }) : undefined;
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
      <PageRowMenu page={page}>
        <div
          {...rowDrag.grabProps(page.slot.id)}
          {...rowDrag.dropProps(target)}
          onClick={onClick}
          title={hint}
          aria-current={expanded ? "page" : undefined}
          aria-selected={selected}
          style={{ paddingLeft: 4 + depth * INDENT_PX }}
          className={cn(
            "group relative flex cursor-default items-center gap-2 rounded-sm px-1 py-1 hover:bg-hover",
            selected && "bg-primary-soft hover:bg-primary-soft",
            rowDropLine(drag?.overId === target ? drag.side : null),
            carried && "opacity-50",
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
      </PageRowMenu>
      {expanded && page.options.length > 1 && <BrochureOptionsList page={page} />}
    </li>
  );
}
