import { memo, useState } from "react";
import { ChevronRight, CornerLeftDown, Eye, EyeOff, Lock, Unlock } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { layerNameOf } from "@design";
import { cn } from "@shared/ui/lib/utils";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { LAYER_METRICS } from "./layer-metrics";
import { LayerIcon } from "./layer-icon";
import { LayerName } from "./layer-name";
import type { LayerRowProps } from "./layer-row.types";

/**
 * One layer of the list. Click selects it (Shift or Ctrl/Cmd adds), double-click renames it,
 * dragging moves it; the eye and lock show on hover, or stay while hidden or locked. Memoized:
 * a row draws again only when its own layer or state changes.
 */
export const LayerRow = memo(function LayerRow({
  item,
  top,
  selected,
  masked,
  dropInside,
  dragged,
  onToggle,
  onSelect,
  onPress,
}: LayerRowProps) {
  const engine = useDesignEngine();
  const [renaming, setRenaming] = useState(false);
  const { node, depth, hasChildren, expanded } = item;

  const update = (patch: ElementPatch) => {
    engine.doc.checkpoint();
    engine.doc.update(node.id, patch);
  };

  return (
    <li
      role="treeitem"
      aria-level={depth + 1}
      aria-selected={selected}
      aria-expanded={hasChildren ? expanded : undefined}
      tabIndex={-1}
      onPointerDown={(event) => !renaming && onPress(event, item)}
      onClick={(event) => onSelect(node.id, event.shiftKey || event.ctrlKey || event.metaKey)}
      onDoubleClick={() => setRenaming(true)}
      style={{
        top,
        height: LAYER_METRICS.rowHeight,
        paddingLeft: LAYER_METRICS.baseIndent + depth * LAYER_METRICS.indent,
      }}
      className={cn(
        "group absolute inset-x-0 flex cursor-default items-center gap-1 rounded-sm pr-1 text-sm text-foreground select-none hover:bg-hover",
        selected && "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
        !node.visible && "text-muted-foreground",
        dropInside && "ring-2 ring-primary ring-inset",
        dragged && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label={expanded ? "Collapse" : "Expand"}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(node.id);
        }}
        className={cn(
          "flex size-4 shrink-0 cursor-pointer items-center justify-center text-subtle-foreground",
          !hasChildren && "invisible",
        )}
      >
        <ChevronRight className={cn("size-3 transition-transform", expanded && "rotate-90")} />
      </button>
      {masked && (
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
    </li>
  );
});
