import { useState } from "react";

import { DESIGN_PAGES } from "../design-pages";
import { cn } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { LayerName } from "../../layers/ui";
import { PageMenu } from "./page-menu";
import type { PageRowProps } from "./page-row.types";

/** The drag data type of a page row. */
const PAGE_DRAG = "application/x-cloudy-page";

/**
 * One page: click shows it, double-click renames it, ⋯ opens its menu, and rows drag to reorder
 * (dropped on the upper half of a row, a page goes before it; on the lower half, after it).
 */
export function PageRow({ page, position, current, deletable, onDropPage }: PageRowProps) {
  const engine = useDesignEngine();
  const [renaming, setRenaming] = useState(false);
  const [drop, setDrop] = useState<"before" | "after" | null>(null);

  return (
    <li
      draggable={!renaming}
      onDragStart={(event) => {
        event.dataTransfer.setData(PAGE_DRAG, page.id);
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
        const id = event.dataTransfer.getData(PAGE_DRAG);
        setDrop(null);
        if (!id) return;
        event.preventDefault();
        onDropPage(id, drop === "after" ? position + 1 : position);
      }}
      onClick={() => engine.setScope(page.id)}
      onDoubleClick={() => setRenaming(true)}
      aria-current={current ? "page" : undefined}
      className={cn(
        "group relative flex h-7 cursor-default items-center gap-1 rounded-sm pr-1 pl-1 text-sm text-foreground hover:bg-hover",
        current && "bg-muted font-medium hover:bg-muted",
        drop === "before" &&
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-primary",
        drop === "after" &&
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-primary",
      )}
    >
      <LayerName
        name={page.name}
        editing={renaming}
        onRename={(name) => engine.service(DESIGN_PAGES).rename(page.id, name)}
        onDone={() => setRenaming(false)}
      />
      <PageMenu page={page} deletable={deletable} onRename={() => setRenaming(true)} />
    </li>
  );
}
