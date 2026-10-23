import { useCallback, useRef } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { useVirtualList } from "@shared/ui/hooks/use-virtual-list";
import { DropIndicator } from "./drag/drop-indicator";
import { useLayerDrag } from "./drag/use-layer-drag";
import { LAYER_METRICS } from "./layer-metrics";
import { LayerRow } from "./layer-row";
import type { LayersListProps } from "./layers-list.types";

/**
 * The layers as one flat list of rows, drawing only those in view (pages can hold thousands), with
 * drag and drop to reorder them and move them into and out of frames, sections and groups.
 */
export function LayersList({
  rows,
  tree,
  selected,
  masked,
  onToggle,
  onExpand,
  draggable,
}: LayersListProps) {
  const engine = useDesignEngine();
  const scroll = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const range = useVirtualList(scroll, rows.length, LAYER_METRICS.rowHeight);
  const { drag, press } = useLayerDrag({
    rows,
    tree,
    list,
    scroll,
    metrics: LAYER_METRICS,
    expand: onExpand,
    enabled: draggable,
  });

  const select = useCallback(
    (id: string, adds: boolean) => {
      if (!adds) return engine.select([id]);
      const ids = engine.selectedIds();
      engine.select(ids.includes(id) ? ids : [...ids, id]);
    },
    [engine],
  );

  return (
    <div ref={scroll} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
      <ul
        ref={list}
        role="tree"
        aria-label="Layers"
        className="relative"
        style={{ height: range.totalHeight }}
      >
        {rows.slice(range.start, range.end).map((item, i) => (
          <LayerRow
            key={item.node.id}
            item={item}
            top={(range.start + i) * LAYER_METRICS.rowHeight}
            selected={selected.has(item.node.id)}
            masked={masked.has(item.node.id)}
            dropInside={drag?.drop?.inside === item.node.id}
            dragged={drag?.moving.has(item.node.id) ?? false}
            onToggle={onToggle}
            onSelect={select}
            onPress={press}
          />
        ))}
        {drag && <DropIndicator drag={drag} metrics={LAYER_METRICS} />}
      </ul>
    </div>
  );
}
