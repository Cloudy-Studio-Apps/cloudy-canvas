import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { DragGhost, rowDropIndex, useRowDrag } from "@canvas-ui";
import { DESIGN_PAGES } from "../design-pages";
import { PanelAddButton } from "@design/ui/components/panel";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button, cn } from "@shared/ui/kit";
import { addPage } from "./page-actions";
import { PageRow } from "./page-row";
import { usePages } from "./use-pages";
import { t } from "../pages.i18n";

/**
 * The design's pages, below its layers: the one on screen is highlighted. "+" adds a
 * page after it; the header folds the list away.
 */
export function PagesSection() {
  const engine = useDesignEngine();
  const pages = usePages();
  const current = useDesignState((state) => state.scope);
  const [open, setOpen] = useState(true);
  const rowDrag = useRowDrag({
    onDrop: (id, overId, side) => {
      const indexOf = (pageId: string) => pages.findIndex((other) => other.id === pageId);
      const to = rowDropIndex(indexOf(id), indexOf(overId), side);
      engine.service(DESIGN_PAGES).reorder(id, to);
    },
  });
  const dragged = pages.find((page) => page.id === rowDrag.drag?.id);

  return (
    <section className="shrink-0 border-t px-1.5 pb-1.5">
      <header className="flex h-10 items-center justify-between gap-1 pr-1.5 pl-1.5">
        <Button
          variant="ghost"
          size="xs"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="-ml-1.5 font-semibold text-foreground"
        >
          {t("list.title")}
          <ChevronRight
            className={cn(
              "size-3 text-subtle-foreground transition-transform",
              open && "rotate-90",
            )}
          />
        </Button>
        <PanelAddButton label={t("list.add")} onClick={() => addPage(engine)} />
      </header>
      {open && (
        <ul aria-label={t("list.title")} className="flex max-h-48 flex-col gap-px overflow-y-auto">
          {pages.map((page) => (
            <PageRow
              key={page.id}
              page={page}
              current={page.id === current}
              deletable={pages.length > 1}
              rowDrag={rowDrag}
            />
          ))}
        </ul>
      )}
      {dragged && rowDrag.drag && <DragGhost label={dragged.name} pointer={rowDrag.drag.pointer} />}
    </section>
  );
}
