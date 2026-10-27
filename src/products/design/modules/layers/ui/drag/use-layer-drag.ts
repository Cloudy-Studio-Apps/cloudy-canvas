import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

import { MOVE_THRESHOLD_PX, type CanvasElement } from "@canvas";
import {
  holdsLayers,
  layerNameOf,
  moveIntoProblem,
  moveLayers,
  selectionRoots,
  type DesignNode,
  type LayerDestination,
} from "../../../core";
import { notifyError } from "@shared/stores/toast-store";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { LayerRowItem } from "../visible-rows.types";
import { layerDrop } from "./layer-drop";
import type { LayerDragOptions, LayerDragState } from "./layer-drop.types";
import { t } from "../../layers.i18n";

/** How close to the list's top or bottom edge (px) the pointer scrolls it while dragging. */
const SCROLL_EDGE = 28;
/** The fastest it scrolls, in px per frame. */
const SCROLL_SPEED = 14;
/** How long (ms) dragging over a closed layer's middle takes to open it. */
const EXPAND_DELAY = 600;

/**
 * Dragging layers in the layers list, as in Figma: a press on a row past `MOVE_THRESHOLD_PX`
 * drags the selection (or that row, which gets selected), the list scrolls at its edges and opens
 * a closed layer held over, Esc cancels and the drop moves the layers in one undo step
 * (`moveLayers`). Returns the drag (for the indicator and ghost) and the rows' press handler.
 */
export function useLayerDrag(options: LayerDragOptions): {
  drag: LayerDragState | null;
  press: (event: PointerEvent<HTMLElement>, item: LayerRowItem) => void;
} {
  const engine = useDesignEngine();
  const [drag, setDrag] = useState<LayerDragState | null>(null);
  // The latest rows and tree, read by the listeners of a drag that outlives renders.
  const latest = useRef(options);
  const stopActive = useRef<(() => void) | null>(null);
  useEffect(() => {
    latest.current = options;
  });
  useEffect(() => () => stopActive.current?.(), []);

  const press = useCallback(
    (event: PointerEvent<HTMLElement>, item: LayerRowItem) => {
      if (!latest.current.enabled || event.button !== 0) return;
      if ((event.target as HTMLElement).closest("button, input")) return;
      const start = { x: event.clientX, y: event.clientY };
      let pointer = start;
      let session: DragSession | null = null;
      let frame = 0;
      let expandTimer = 0;
      let hovered: string | null = null;
      // The last drop, for pointerup (the state may not have rendered yet).
      let latestDrop: LayerDragState["drop"] = null;

      const update = () => {
        const { list, rows, tree, metrics } = latest.current;
        const box = list.current?.getBoundingClientRect();
        if (!session || !box) return;
        const drop = layerDrop({
          rows,
          tree,
          moving: session.moving,
          x: pointer.x - box.left,
          y: pointer.y - box.top,
          metrics,
          holds: (node) => holdsLayers(engine.kinds.kindOf(node)),
          allowed: session.allowed,
        });
        latestDrop = drop;
        setDrag({ moving: session.moving, label: session.label, pointer, drop });
        holdToExpand(drop?.inside ?? null, rows);
      };

      // A closed layer held over for a moment opens.
      const holdToExpand = (id: string | null, rows: readonly LayerRowItem[]) => {
        if (id === hovered) return;
        hovered = id;
        window.clearTimeout(expandTimer);
        const row = id ? rows.find((r) => r.node.id === id) : undefined;
        if (!row?.hasChildren || row.expanded) return;
        expandTimer = window.setTimeout(() => {
          latest.current.expand(row.node.id);
          update();
        }, EXPAND_DELAY);
      };

      // Scrolls while the pointer is near the list's top or bottom edge.
      const autoScroll = () => {
        frame = requestAnimationFrame(autoScroll);
        const scroller = latest.current.scroll.current;
        if (!session || !scroller) return;
        const box = scroller.getBoundingClientRect();
        const near =
          pointer.y < box.top + SCROLL_EDGE
            ? -(box.top + SCROLL_EDGE - pointer.y)
            : pointer.y > box.bottom - SCROLL_EDGE
              ? pointer.y - (box.bottom - SCROLL_EDGE)
              : 0;
        if (near === 0) return;
        const step = Math.sign(near) * Math.min(SCROLL_SPEED, Math.ceil(Math.abs(near) / 2));
        const before = scroller.scrollTop;
        scroller.scrollTop += step;
        if (scroller.scrollTop !== before) update();
      };

      const begin = () => {
        const selected = engine.selectedIds();
        const ids = selected.includes(item.node.id) ? selected : [item.node.id];
        if (ids !== selected) engine.select(ids);
        session = dragSession(engine.doc.all(), ids, engine.kinds);
        frame = requestAnimationFrame(autoScroll);
      };

      const move = (e: globalThis.PointerEvent) => {
        pointer = { x: e.clientX, y: e.clientY };
        if (!session) {
          if (Math.hypot(pointer.x - start.x, pointer.y - start.y) < MOVE_THRESHOLD_PX) return;
          begin();
        }
        update();
      };

      const finish = (drop: boolean) => {
        stop();
        if (!session) return;
        // The click that ends a drag doesn't select the row under it.
        const swallow = (e: MouseEvent) => e.stopPropagation();
        window.addEventListener("click", swallow, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }));
        const destination = drop ? latestDrop?.destination : undefined;
        if (destination) commit(session, destination);
      };

      const commit = (current: DragSession, destination: LayerDestination) => {
        try {
          engine.doc.checkpoint();
          const moved = moveLayers(engine.doc, engine.kinds, current.moving, destination);
          if (moved.length > 0) engine.select(moved);
        } catch (error) {
          notifyError(t("errors.moveFailed"), error);
        }
      };

      const up = () => finish(true);
      const cancel = () => finish(false);
      const key = (e: KeyboardEvent) => {
        if (e.key !== "Escape" || !session) return;
        e.preventDefault();
        e.stopPropagation();
        cancel();
      };

      const stop = () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(expandTimer);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
        window.removeEventListener("keydown", key, { capture: true });
        stopActive.current = null;
        setDrag(null);
      };

      stopActive.current?.();
      stopActive.current = stop;
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
      window.addEventListener("keydown", key, { capture: true });
    },
    [engine],
  );

  return { drag, press };
}

interface DragSession {
  /** The dragged layers, without those inside another dragged one. */
  moving: ReadonlySet<string>;
  label: string;
  /** Whether they may all go to a destination (cached by parent). */
  allowed: (destination: LayerDestination) => boolean;
}

function dragSession(
  elements: readonly CanvasElement[],
  ids: readonly string[],
  kinds: Parameters<typeof layerNameOf>[1],
): DragSession {
  const roots: DesignNode[] = selectionRoots(new Set(ids), elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  const verdicts = new Map<string | null, boolean>();
  return {
    moving: new Set(roots.map((node) => node.id)),
    label: roots.length === 1 ? layerNameOf(roots[0]!, kinds) : `${roots.length} layers`,
    allowed: ({ parentId }) => {
      const known = verdicts.get(parentId);
      if (known !== undefined) return known;
      const parent = parentId === null ? null : (byId.get(parentId) ?? null);
      const ok = roots.every((node) => moveIntoProblem(node, parent, kinds, byId) === null);
      verdicts.set(parentId, ok);
      return ok;
    },
  };
}
