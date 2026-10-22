import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { DESIGN_PAGES } from "@design";
import { PanelAddButton } from "@design/ui/components/panel";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/lib/utils";
import { addPage } from "./page-actions";
import { PageRow } from "./page-row";
import { usePages } from "./use-pages";

/**
 * The design's pages, below its layers: the one on screen is highlighted. "+" adds a
 * page after it; the header folds the list away.
 */
export function PagesSection() {
  const engine = useDesignEngine();
  const pages = usePages();
  const current = useDesignState((state) => state.scope);
  const [open, setOpen] = useState(true);

  return (
    <section className="shrink-0 border-t px-1.5 pb-1.5">
      <header className="flex h-10 items-center justify-between gap-1 pr-1.5 pl-1.5">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-foreground"
        >
          Pages
          <ChevronRight
            className={cn(
              "size-3 text-subtle-foreground transition-transform",
              open && "rotate-90",
            )}
          />
        </button>
        <PanelAddButton label="Add page" onClick={() => addPage(engine)} />
      </header>
      {open && (
        <ul aria-label="Pages" className="flex max-h-48 flex-col gap-px overflow-y-auto">
          {pages.map((page, i) => (
            <PageRow
              key={page.id}
              page={page}
              position={i}
              current={page.id === current}
              deletable={pages.length > 1}
              onDropPage={(id, position) => {
                // Dropped after itself or below: the slot shifts once it leaves its place.
                const from = pages.findIndex((other) => other.id === id);
                engine.service(DESIGN_PAGES).reorder(id, from < position ? position - 1 : position);
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
