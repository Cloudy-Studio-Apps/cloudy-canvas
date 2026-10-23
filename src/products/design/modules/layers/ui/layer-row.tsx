import { useState } from "react";
import { ChevronRight, CornerLeftDown, Eye, EyeOff, Lock, Unlock } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { layerNameOf } from "@design";
import { cn } from "@shared/ui/lib/utils";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { LayerIcon } from "./layer-icon";
import { LayerName } from "./layer-name";
import type { LayerRowProps } from "./layer-row.types";

/** Indent per tree level, in pixels. */
const INDENT = 14;

/**
 * One layer and, when open, its children. Click selects it (Shift or Ctrl/Cmd adds), double-click
 * renames it; the eye and lock show on hover, or stay while hidden or locked.
 */
export function LayerRow({ node, tree, depth, selected, revealed, masked }: LayerRowProps) {
  const engine = useDesignEngine();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const children = tree.get(node.id) ?? [];
  const expanded = open || revealed.has(node.id);
  const isSelected = selected.has(node.id);

  const update = (patch: ElementPatch) => {
    engine.doc.checkpoint();
    engine.doc.update(node.id, patch);
  };

  return (
    <li>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={children.length > 0 ? expanded : undefined}
        tabIndex={-1}
        onClick={(event) => {
          const adds = event.shiftKey || event.ctrlKey || event.metaKey;
          engine.select(adds ? [...selected, node.id] : [node.id]);
        }}
        onDoubleClick={() => setRenaming(true)}
        style={{ paddingLeft: 4 + depth * INDENT }}
        className={cn(
          "group flex h-7 cursor-default items-center gap-1 rounded-sm pr-1 text-sm text-foreground hover:bg-hover",
          isSelected && "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
          !node.visible && "text-muted-foreground",
        )}
      >
        <button
          type="button"
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(!expanded);
          }}
          className={cn(
            "flex size-4 shrink-0 cursor-pointer items-center justify-center text-subtle-foreground",
            children.length === 0 && "invisible",
          )}
        >
          <ChevronRight className={cn("size-3 transition-transform", expanded && "rotate-90")} />
        </button>
        {masked.has(node.id) && (
          <span
            title="Masked"
            className="flex shrink-0 text-subtle-foreground [&_svg]:size-3"
            aria-label="Masked"
          >
            <CornerLeftDown />
          </span>
        )}
        <span className="flex shrink-0 text-muted-foreground [&_svg]:size-3.5">
          <LayerIcon node={node} />
        </span>
        <LayerName
          name={layerNameOf(node, engine.kinds)}
          editing={renaming}
          onRename={(name) => update({ name } as ElementPatch)}
          onDone={() => setRenaming(false)}
        />
        <span className="flex items-center gap-0.5 text-muted-foreground [&_svg]:size-3.5">
          <button
            type="button"
            aria-label={node.locked ? "Unlock" : "Lock"}
            title={node.locked ? "Unlock" : "Lock"}
            onClick={(event) => {
              event.stopPropagation();
              engine.setLocked([node.id], !node.locked);
            }}
            className={cn(
              "flex size-5 cursor-pointer items-center justify-center rounded-xs hover:text-foreground",
              !node.locked && "invisible group-hover:visible",
            )}
          >
            {node.locked ? <Lock /> : <Unlock />}
          </button>
          <button
            type="button"
            aria-label={node.visible ? "Hide" : "Show"}
            title={node.visible ? "Hide" : "Show"}
            onClick={(event) => {
              event.stopPropagation();
              update({ visible: !node.visible } as ElementPatch);
            }}
            className={cn(
              "flex size-5 cursor-pointer items-center justify-center rounded-xs hover:text-foreground",
              node.visible && "invisible group-hover:visible",
            )}
          >
            {node.visible ? <Eye /> : <EyeOff />}
          </button>
        </span>
      </div>
      {expanded && children.length > 0 && (
        <ul role="group">
          {children.map((child) => (
            <LayerRow
              key={child.id}
              node={child}
              tree={tree}
              depth={depth + 1}
              selected={selected}
              revealed={revealed}
              masked={masked}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
