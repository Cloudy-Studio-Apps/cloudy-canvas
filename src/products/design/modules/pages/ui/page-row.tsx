import { useState } from "react";

import { rowDropLine } from "@canvas-ui";
import { DESIGN_PAGES } from "../design-pages";
import { cn } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { LayerName } from "../../layers/ui";
import { PageMenu } from "./page-menu";
import type { PageRowProps } from "./page-row.types";

/**
 * One page: click shows it, double-click renames it, ⋯ opens its menu, and rows drag to reorder
 * (`rowDrag`, owned by the list).
 */
export function PageRow({ page, current, deletable, rowDrag }: PageRowProps) {
  const engine = useDesignEngine();
  const [renaming, setRenaming] = useState(false);
  const { drag } = rowDrag;

  return (
    <li
      {...rowDrag.grabProps(page.id, !renaming)}
      {...rowDrag.dropProps(page.id)}
      onClick={() => engine.setScope(page.id)}
      onDoubleClick={() => setRenaming(true)}
      aria-current={current ? "page" : undefined}
      className={cn(
        "group relative flex h-7 cursor-default items-center gap-1 rounded-sm pr-1 pl-1 text-sm text-foreground hover:bg-hover",
        current && "bg-muted font-medium hover:bg-muted",
        rowDropLine(drag?.overId === page.id ? drag.side : null),
        drag?.id === page.id && "opacity-50",
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
