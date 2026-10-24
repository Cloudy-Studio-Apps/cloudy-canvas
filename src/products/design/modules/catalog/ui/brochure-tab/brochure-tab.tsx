import { Fragment } from "react";
import { ListChecks } from "lucide-react";

import { CATALOG_PICK_TOOL, DESIGN_BROCHURE, paperSize, type BookSide } from "@design";
import { PanelAddButton, PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { addBlankPage } from "../page-actions";
import { BlankPageRow } from "./blank-page-row";
import { BrochureEmpty } from "./brochure-empty";
import { BrochurePageRow } from "./brochure-page-row";
import { spreadLabel } from "./spread-label";

/**
 * The Catalog mode's left tab: the brochure's pages in order, to drag into place. In the book
 * layout they're grouped as they're read (covers, spreads) with the blank pages the layout adds;
 * "Pick frames" ticks frames on the canvas and "+" adds a blank page the size of the last one.
 */
export function BrochureTab() {
  const engine = useDesignEngine();
  const { pages, settings, layout, label } = useBrochure();
  const selection = useCatalogSelection();
  const selectedSlot = selection.kind === "page" ? selection.page.slot.id : null;
  const last = pages.at(-1)?.frame;
  const book = settings.layout === "book";

  const row = (side: BookSide, index: number) => {
    if (side.kind === "blank")
      return <BlankPageRow key={`blank:${index}`} number={index + 1} reason={side.reason} />;
    // A spread frame's two sides are one row, at its left side.
    if (side.part === "right") return null;
    const { page } = side;
    return (
      <BrochurePageRow
        key={page.slot.id}
        page={page}
        label={label(page)}
        position={pages.indexOf(page)}
        selected={page.slot.id === selectedSlot}
        onDropPage={(slotId, to) => {
          // Dropped after itself or below: the slot shifts once it leaves its place.
          const from = pages.findIndex((other) => other.slot.id === slotId);
          engine.service(DESIGN_BROCHURE).move(slotId, from < to ? to - 1 : to);
        }}
      />
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <h2 className="text-xs font-semibold text-foreground">
          Pages <span className="font-normal text-muted-foreground">{layout.pageCount}</span>
        </h2>
        <div className="flex items-center gap-0.5">
          <PanelIconButton label="Pick frames" onClick={() => engine.setTool(CATALOG_PICK_TOOL)}>
            <ListChecks />
          </PanelIconButton>
          {last && (
            <PanelAddButton
              label="Add a blank page"
              onClick={() => addBlankPage(engine, last, paperSize(last).name ?? "Page")}
            />
          )}
        </div>
      </header>
      {pages.length === 0 ? (
        <BrochureEmpty />
      ) : (
        <ul aria-label="Brochure pages" className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
          {layout.spreads.map((spread) => (
            <Fragment key={spread.join("-")}>
              {book && (
                <li className="px-1 pt-2 pb-0.5 text-[10px] font-medium tracking-wide text-subtle-foreground uppercase">
                  {spreadLabel(layout, spread)}
                </li>
              )}
              {spread.map((index) => {
                const side = layout.sides[index];
                return side ? row(side, index) : null;
              })}
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}
