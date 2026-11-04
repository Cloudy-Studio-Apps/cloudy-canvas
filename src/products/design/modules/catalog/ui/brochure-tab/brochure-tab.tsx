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
import { usePageListSelection } from "../hooks/use-page-list-selection";
import { addBlankPage } from "../page-actions";
import { BlankPageRow } from "./blank-page-row";
import { BrochureEmpty } from "./brochure-empty";
import { BrochurePageRow } from "./brochure-page-row";
import { BrochureSwitcher } from "./brochure-switcher";
import { dropId, dropPosition, dropsBackCover, parseDropId } from "./drop-position";
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
 * the back cover), and after the last row goes last. Ctrl/⌘ and Shift + click select several
 * pages, which drag together (and move a place with Alt+↑/↓);
 * "Pick frames" ticks frames on the canvas and "+" adds a blank page the size of the last one.
 */
export function BrochureTab() {
  const engine = useDesignEngine();
  const { brochure, pages, settings, layout, label } = useBrochure();
  const selection = useCatalogSelection();
  const selectedSlot = selection.kind === "page" ? selection.page.slot.id : null;
  const last = pages.at(-1)?.frame;
  const book = settings.layout === "book";
  const list = usePageListSelection(pages);
  const rowDrag = useRowDrag({
    // Pages, blank pages, spread headings and the list's end all take the dragged pages.
    onDrop: (id, overId, side) => {
      const target = parseDropId(overId);
      if (!target || !brochure) return;
      const dragged = list.draggedFor(id);
      // The back cover dropped on its own blank: it becomes a page, the back cover goes.
      if (dropsBackCover(layout, dragged, target)) {
        brochure.setSettings({ covers: settings.covers === "both" ? "front" : "none" });
        return;
      }
      const position = dropPosition(layout, pages, dragged, target, side);
      if (position !== null) brochure.moveMany(dragged, position);
    },
    canDrop: (id, overId) =>
      !list.draggedFor(id).some((slotId) => overId === dropId({ kind: "page", slotId })),
  });
  const carried = new Set(rowDrag.drag ? list.draggedFor(rowDrag.drag.id) : []);
  const dragged = pages.find((page) => page.slot.id === rowDrag.drag?.id);
  const ghost =
    carried.size > 1 ? t("tab.dragCount", { count: carried.size }) : (dragged?.frame.name ?? "");

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
        selected={list.selected.has(page.slot.id)}
        expanded={page.slot.id === selectedSlot}
        carried={carried.has(page.slot.id)}
        onClick={(event) => list.click(page, event)}
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
      {dragged && rowDrag.drag && <DragGhost label={ghost} pointer={rowDrag.drag.pointer} />}
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <h2 className="text-xs font-semibold text-foreground">
          {t("tab.pagesHeading")}{" "}
          <span className="font-normal text-muted-foreground">{layout.pageCount}</span>
          {list.selected.size > 1 && (
            <span className="ml-1.5 rounded-sm bg-primary-soft px-1.5 py-px text-[11px] font-normal text-primary-soft-foreground">
              {t("tab.selected", { count: list.selected.size })}
            </span>
          )}
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
