import { useState } from "react";
import { ChevronRight, Eye, Lock } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { LayerIcon } from "./layer-icon";
import type { LayerRowProps } from "./layer-row.types";

/** One row of the layers tree, with its children when expanded. */
export function LayerRow({ layer, depth, selectedId, onSelect }: LayerRowProps) {
  const [open, setOpen] = useState(depth === 0 && layer.id === "hero");
  const selected = selectedId === layer.id;
  const hasChildren = !!layer.children?.length;

  return (
    <li>
      <div
        role="treeitem"
        aria-selected={selected}
        aria-expanded={hasChildren ? open : undefined}
        tabIndex={-1}
        onClick={() => onSelect(layer.id)}
        style={{ paddingLeft: 4 + depth * 14 }}
        className={cn(
          "group flex h-7 cursor-default items-center gap-1 rounded-sm pr-1 text-sm text-foreground hover:bg-hover",
          selected && "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
          layer.type === "component" && !selected && "text-design-foreground",
        )}
      >
        <button
          type="button"
          aria-label={open ? "Collapse" : "Expand"}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(!open);
          }}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center text-subtle-foreground",
            !hasChildren && "invisible",
          )}
        >
          <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} />
        </button>
        <span className="flex shrink-0 text-muted-foreground [&_svg]:size-3.5">
          <LayerIcon type={layer.type} />
        </span>
        <span className="ml-1 min-w-0 flex-1 truncate">{layer.name}</span>
        <span className="hidden items-center gap-1 text-muted-foreground group-hover:flex [&_svg]:size-3.5">
          <Lock />
          <Eye />
        </span>
      </div>
      {hasChildren && open && (
        <ul role="group">
          {layer.children?.map((child) => (
            <LayerRow
              key={child.id}
              layer={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
