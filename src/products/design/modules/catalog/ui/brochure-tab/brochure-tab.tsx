import { ListChecks } from "lucide-react";

import { DragGhost } from "@canvas-ui";
import { CATALOG_PICK_TOOL } from "../../mode/catalog-mode.constants";
import { placeSections } from "../../model/sections";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { usePageListSelection } from "../hooks/use-page-list-selection";
import { AddPageMenu } from "./add-page-menu";
import { BlankPageRow } from "./blank-page-row";
import { BrochureEmpty } from "./brochure-empty";
import { BrochurePageRow } from "./brochure-page-row";
import { BrochureSwitcher } from "./brochure-switcher";
import { dropId } from "./drop-position";
import { ListEndDrop } from "./list-end-drop";
import { MastersSection } from "./masters-section";
import { NoBrochure } from "./no-brochure";
import { PagesListMenu } from "./pages-list-menu";
import { pageTree } from "./page-tree";
import type { PageTreeRow } from "./page-tree.types";
import { SectionFolderRow } from "./section-folder-row";
import { SpreadHeadingRow } from "./spread-heading-row";
import { spreadLabel } from "./spread-label";
import { useAddPageEntries } from "./use-add-page-entries";
import { usePageListDrag } from "./use-page-list-drag";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { t } from "../../catalog.i18n";

/**
 * The Catalog mode's left tab: the design page's open brochure (`BrochureSwitcher` picks, makes,
 * renames and deletes the page's brochures) and its pages in order, to drag into place. In the book
 * layout they're grouped as they're read (covers, spreads) with the blank pages the layout adds;
 * a page dropped on a blank page takes its place, on a spread's heading starts that spread (or is
 * the back cover), and after the last row goes last. Ctrl/⌘ and Shift + click select several
 * pages, which drag together (and move a place with Alt+↑/↓);
 * "Pick frames" ticks frames on the canvas; "+" and a right-click on the list add a blank page the
 * size of the last one or a new section on one, and a right-click on a page adds them after it.
 * Its masters are listed above the pages. Sections are folders over their pages, subsections
 * inside them (`pageTree`), that fold away, drag with their pages and take dropped pages.
 */
export function BrochureTab() {
  const engine = useDesignEngine();
  const { brochure, pages, settings, layout, label, sections, numbers } = useBrochure();
  const selection = useCatalogSelection();
  const collapsed = useCatalogViewStore((state) => state.collapsed);
  const selectedSlot = selection.kind === "page" ? selection.page.slot.id : null;
  const last = pages.at(-1)?.frame;
  const list = usePageListSelection(pages);
  const adds = useAddPageEntries(last);
  const slots = brochure?.record()?.slots ?? [];
  const rows = pageTree(
    layout,
    placeSections(sections, slots),
    numbers,
    new Set(collapsed),
    settings.layout === "book",
  );
  const folders = new Map(
    rows.flatMap((row) => (row.kind === "folder" ? [[row.placed.section.id, row] as const] : [])),
  );
  const { rowDrag, carried, ghost } = usePageListDrag({ list, folders });

  const render = (row: PageTreeRow) => {
    switch (row.kind) {
      case "folder":
        return (
          <SectionFolderRow
            key={`section:${row.placed.section.id}`}
            folder={row}
            rowDrag={rowDrag}
            carried={row.slots.length > 0 && row.slots.every((slot) => carried.has(slot))}
          />
        );
      case "spread":
        return (
          <SpreadHeadingRow
            key={`spread:${row.spread.join("-")}`}
            label={spreadLabel(layout, row.spread)}
            rowDrag={rowDrag}
            dropId={dropId({ kind: "spread", first: row.spread[0] ?? 0 })}
            depth={row.depth}
          />
        );
      case "side": {
        const { side, index, depth } = row;
        if (side.kind === "blank")
          return (
            <BlankPageRow
              key={`blank:${index}`}
              number={String(numbers[index]?.number ?? index + 1)}
              reason={side.reason}
              rowDrag={rowDrag}
              dropId={dropId({ kind: "blank", side: index })}
              depth={depth}
            />
          );
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
            depth={depth}
          />
        );
      }
    }
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
      <MastersSection />
      {ghost && rowDrag.drag && <DragGhost label={ghost} pointer={rowDrag.drag.pointer} />}
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
          {adds.length > 0 && <AddPageMenu entries={adds} />}
        </div>
      </header>
      {pages.length === 0 ? (
        <BrochureEmpty />
      ) : (
        <PagesListMenu entries={adds}>
          <ul
            aria-label={t("tab.pages")}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2"
          >
            {rows.map(render)}
            <ListEndDrop rowDrag={rowDrag} />
          </ul>
        </PagesListMenu>
      )}
    </div>
  );
}
