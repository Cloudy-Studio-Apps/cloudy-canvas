import { Fragment } from "react";
import { ListChecks } from "lucide-react";

import { brochureSpreads, CATALOG_PICK_TOOL, DESIGN_BROCHURE, paperSize } from "@design";
import { PanelAddButton, PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { addBlankPage } from "../page-actions";
import { BrochureEmpty } from "./brochure-empty";
import { BrochurePageRow } from "./brochure-page-row";

/**
 * The Catalog mode's left tab: the brochure's pages in order (grouped in spreads with facing
 * pages), to drag into place; "Pick frames" ticks frames on the canvas and "+" adds a blank page
 * the size of the last one.
 */
export function BrochureTab() {
  const engine = useDesignEngine();
  const { pages, settings } = useBrochure();
  const selection = useCatalogSelection();
  const selectedSlot = selection.kind === "page" ? selection.page.slot.id : null;
  const last = pages.at(-1)?.frame;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <h2 className="text-xs font-semibold text-foreground">
          Pages <span className="font-normal text-muted-foreground">{pages.length}</span>
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
          {brochureSpreads(pages.length, settings.facing).map((spread) => (
            <Fragment key={spread.join("-")}>
              {settings.facing && (
                <li className="px-1 pt-2 pb-0.5 text-[10px] font-medium tracking-wide text-subtle-foreground uppercase">
                  {spreadLabel(spread, pages.length)}
                </li>
              )}
              {spread.map((position) => {
                const page = pages[position];
                if (!page) return null;
                return (
                  <BrochurePageRow
                    key={page.slot.id}
                    page={page}
                    position={position}
                    selected={page.slot.id === selectedSlot}
                    onDropPage={(slotId, to) => {
                      // Dropped after itself or below: the slot shifts once it leaves its place.
                      const from = pages.findIndex((other) => other.slot.id === slotId);
                      engine.service(DESIGN_BROCHURE).move(slotId, from < to ? to - 1 : to);
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "Cover", "Pages 2–3", or "Back cover" for the last one on its own. */
function spreadLabel([first = 0, second]: readonly number[], count: number): string {
  if (first === 0) return "Cover";
  if (second !== undefined) return `Pages ${first + 1}–${second + 1}`;
  return first === count - 1 ? "Back cover" : `Page ${first + 1}`;
}
