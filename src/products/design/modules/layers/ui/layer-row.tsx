import { memo, useState } from "react";
import { ChevronRight, CornerLeftDown, Eye, EyeOff, Lock, Sparkles, Unlock } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { layerNameOf } from "@design";
import { IconButton } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import { useDesignEngine } from "@design/ui/design-engine-context";
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
  metrics,
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
        height: metrics.rowHeight,
        paddingLeft: metrics.baseIndent + depth * metrics.indent,
      }}
      className={cn(
        "group absolute inset-x-0 flex cursor-default items-center gap-1 rounded-sm pr-1 text-sm text-foreground select-none hover:bg-hover",
        selected && "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
        !node.visible && "text-muted-foreground",
        dropInside && "ring-2 ring-primary ring-inset",
        dragged && "opacity-50",
      )}
    >
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the tree's tiny disclosure triangle */}
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
      {node.effects.some((effect) => effect.visible) && (
        <span
          title="Has effects"
          aria-label="Has effects"
          className="flex shrink-0 text-subtle-foreground [&_svg]:size-3"
        >
          <Sparkles />
        </span>
      )}
      <span className="flex items-center gap-0.5">
        <IconButton
          size="xs"
          className="size-5 rounded-xs hover:bg-transparent"
          label={node.locked ? "Unlock" : "Lock"}
          title={node.locked ? "Unlock" : "Lock"}
          tooltip={false}
          revealOnHover={!node.locked}
          onClick={(event) => {
            event.stopPropagation();
            engine.setLocked([node.id], !node.locked);
          }}
        >
          {node.locked ? <Lock /> : <Unlock />}
        </IconButton>
        <IconButton
          size="xs"
          className="size-5 rounded-xs hover:bg-transparent"
          label={node.visible ? "Hide" : "Show"}
          title={node.visible ? "Hide" : "Show"}
          tooltip={false}
          revealOnHover={node.visible}
          onClick={(event) => {
            event.stopPropagation();
            update({ visible: !node.visible } as ElementPatch);
          }}
        >
          {node.visible ? <Eye /> : <EyeOff />}
        </IconButton>
      </span>
    </li>
  );
});
