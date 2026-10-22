import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { gradientHandles, pointAlong, type GradientHandles, type Point } from "@canvas";
import { isGradientPaint, type GradientPaint } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes, useSelectedNodes } from "@design/ui/hooks";
import { useGradientEditStore } from "@design/ui/stores/gradient-edit-store";
import { dragGrip } from "./drag-grip";
import { EndHandle } from "./end-handle";
import type { GradientGrip, NodeFrame, ViewMapping } from "./gradient-handles.types";
import { normalizedToScreen, screenToNormalized } from "./handle-space";

/** The view as a string that changes when the camera does (re-renders the handles). */
function useViewKey(): string {
  const engine = useDesignEngine();
  const subscribe = useCallback((listener: () => void) => engine.onViewChange(listener), [engine]);
  return useSyncExternalStore(subscribe, () => {
    const unit = engine.worldRectToScreen({ x: 0, y: 0, w: 1, h: 1 });
    return `${unit.x},${unit.y},${unit.w}`;
  });
}

/**
 * The handles of the gradient the paint picker edits, over its layer like Figma's: its ends (a
 * radial, angular or diamond gradient's center, radius and width) and its stops along the line,
 * all draggable. Shown only while one layer is selected and the picker is on a gradient.
 */
export function GradientHandles() {
  const target = useGradientEditStore((state) => state.target);
  const selectedStop = useGradientEditStore((state) => state.stop);
  const selectStop = useGradientEditStore((state) => state.setStop);
  const nodes = useSelectedNodes();
  const edit = useEditNodes();
  const viewKey = useViewKey();
  const svg = useRef<SVGSVGElement>(null);

  const node = nodes.length === 1 ? nodes[0] : undefined;
  const paint = target && node ? node[target.field][target.index] : undefined;
  if (!target || !node || !paint || !isGradientPaint(paint) || !paint.visible) return null;

  const [ox = 0, oy = 0, zoom = 1] = viewKey.split(",").map(Number);
  const view: ViewMapping = { origin: { x: ox, y: oy }, zoom };
  const frame: NodeFrame = {
    x: node.x,
    y: node.y,
    w: node.w,
    h: node.h,
    rotation: node.rotation ?? 0,
  };
  const size = { w: node.w, h: node.h };
  const handles = gradientHandles(paint.type, paint.transform);
  const screen = (p: Point) => normalizedToScreen(p, frame, view);
  const { field, index } = target;

  const write = (next: GradientPaint, checkpoint: boolean) =>
    edit(
      [node],
      (current) => ({
        [field]: current[field].map((p, i) => (i === index ? next : p)),
      }),
      { checkpoint },
    );

  const startDrag = (event: ReactPointerEvent<SVGElement>, grip: GradientGrip) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof grip === "object") selectStop(grip.stop);
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    const before: GradientHandles = handles;
    let first = true;
    const move = (e: PointerEvent) => {
      const box = svg.current?.getBoundingClientRect();
      if (!box) return;
      const p = screenToNormalized(
        { x: e.clientX - box.left, y: e.clientY - box.top },
        frame,
        view,
      );
      write(dragGrip(paint, before, grip, p, size, e.shiftKey), first);
      first = false;
    };
    const end = () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
  };

  const start = screen(handles.start);
  const end = screen(handles.end);
  const width = screen(handles.width);
  const linear = paint.type === "linear";

  return (
    <svg ref={svg} className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <g className="text-surface" stroke="currentColor">
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          strokeWidth={3}
          className="text-foreground/40"
        />
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={1.5} />
        {!linear && (
          <>
            <line
              x1={start.x}
              y1={start.y}
              x2={width.x}
              y2={width.y}
              strokeWidth={3}
              className="text-foreground/40"
            />
            <line
              x1={start.x}
              y1={start.y}
              x2={width.x}
              y2={width.y}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          </>
        )}
      </g>
      <EndHandle at={start} label="Gradient start" onPointerDown={(e) => startDrag(e, "start")} />
      <EndHandle at={end} label="Gradient end" onPointerDown={(e) => startDrag(e, "end")} />
      {!linear && (
        <EndHandle
          at={width}
          label="Gradient width"
          small
          onPointerDown={(e) => startDrag(e, "width")}
        />
      )}
      {paint.stops.map((stop, i) => {
        const at = screen(pointAlong(handles, stop.position));
        const selected = i === Math.min(selectedStop, paint.stops.length - 1);
        return (
          <rect
            key={i}
            role="button"
            aria-label={`Stop at ${Math.round(stop.position * 100)}%`}
            x={at.x - 6}
            y={at.y - 6}
            width={12}
            height={12}
            rx={2}
            fill={stop.color}
            strokeWidth={selected ? 3 : 2}
            className={
              selected
                ? "pointer-events-auto cursor-grab stroke-primary"
                : "pointer-events-auto cursor-grab stroke-surface"
            }
            onPointerDown={(e) => startDrag(e, { stop: i })}
          />
        );
      })}
    </svg>
  );
}
