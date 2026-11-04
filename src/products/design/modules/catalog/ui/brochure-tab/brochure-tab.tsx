import { Fragment } from "react";
import { ListChecks } from "lucide-react";

import { DragGhost, useRowDrag } from "@canvas-ui";
import { CATALOG_PICK_TOOL } from "../../mode/catalog-mode.constants";
import { paperSize } from "../../model/paper-size";
import type { BookSide } from "../../model/book-layout.types";
import { PanelAddButton, PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { addBlankPage } from "../page-actions";
import { BlankPageRow } from "./blank-page-row";
import { BrochureEmpty } from "./brochure-empty";
import { BrochurePageRow } from "./brochure-page-row";
import { BrochureSwitcher } from "./brochure-switcher";
import { dropId, dropPosition, parseDropId } from "./drop-position";
import { ListEndDrop } from "./list-end-drop";
import { NoBrochure } from "./no-brochure";
import { SpreadHeadingRow } from "./spread-heading-row";
import { spreadLabel } from "./spread-label";
import { t } from "../../catalog.i18n";

/**
 * The Catalog mode's left tab: the design page's open brochure (`BrochureSwitcher` picks, makes,
 * renames and deletes the page's brochures) and its pages in order, to drag into place. In the book
 * layout they're grouped as they're read (covers, spreads) with the blank pages the layout adds;
 * a page dropped on a blank page takes its place, on a spread's heading starts that spread (or is
 * the back cover), and after the last row goes last;
 * "Pick frames" ticks frames on the canvas and "+" adds a blank page the size of the last one.
 */
export function BrochureTab() {
  const engine = useDesignEngine();
  const { brochure, pages, settings, layout, label } = useBrochure();
  const selection = useCatalogSelection();
  const selectedSlot = selection.kind === "page" ? selection.page.slot.id : null;
  const last = pages.at(-1)?.frame;
  const book = settings.layout === "book";
  const rowDrag = useRowDrag({
    // Pages, blank pages, spread headings and the list's end all take a dropped page.
    onDrop: (id, overId, side) => {
      const target = parseDropId(overId);
      if (target) brochure?.move(id, dropPosition(layout, pages, id, target, side));
    },
    canDrop: (id, overId) => overId !== dropId({ kind: "page", slotId: id }),
  });
  const dragged = pages.find((page) => page.slot.id === rowDrag.drag?.id);

  const row = (side: BookSide, index: number) => {
    if (side.kind === "blank")
      return (
        <BlankPageRow
          key={`blank:${index}`}
          number={index + 1}
          reason={side.reason}
          rowDrag={rowDrag}
          dropId={dropId({ kind: "blank", side: index })}
        />
      );
    // A spread frame's two sides are one row, at its left side.
    if (side.part === "right") return null;
    const { page } = side;
    return (
      <BrochurePageRow
        key={page.slot.id}
        page={page}
        label={label(page)}
        selected={page.slot.id === selectedSlot}
        rowDrag={rowDrag}
      />
    );
  };

  if (!brochure) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <NoBrochure />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BrochureSwitcher />
      {dragged && rowDrag.drag && (
        <DragGhost label={dragged.frame.name} pointer={rowDrag.drag.pointer} />
      )}
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <h2 className="text-xs font-semibold text-foreground">
          {t("tab.pagesHeading")}{" "}
          <span className="font-normal text-muted-foreground">{layout.pageCount}</span>
        </h2>
        <div className="flex items-center gap-0.5">
          <PanelIconButton
            label={t("tab.pickFrames")}
            onClick={() => engine.setTool(CATALOG_PICK_TOOL)}
          >
            <ListChecks />
          </PanelIconButton>
          {last && (
            <PanelAddButton
              label={t("tab.addBlank")}
              onClick={() => addBlankPage(engine, last, paperSize(last).name ?? "Page")}
            />
          )}
        </div>
      </header>
      {pages.length === 0 ? (
        <BrochureEmpty />
      ) : (
        <ul
          aria-label={t("tab.pages")}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2"
        >
          {layout.spreads.map((spread) => (
            <Fragment key={spread.join("-")}>
              {book && (
                <SpreadHeadingRow
                  label={spreadLabel(layout, spread)}
                  rowDrag={rowDrag}
                  dropId={dropId({ kind: "spread", first: spread[0] ?? 0 })}
                />
              )}
              {spread.map((index) => {
                const side = layout.sides[index];
                return side ? row(side, index) : null;
              })}
            </Fragment>
          ))}
          <ListEndDrop rowDrag={rowDrag} />
        </ul>
      )}
    </div>
  );
}
