import { useEffect, useRef, useState } from "react";

import { RULER_SIZE, type GuideDragHandle } from "@canvas";

import { useEngine } from "../../engine-context";
import { drawRuler } from "./draw-ruler";
import type { RulerStripProps } from "./rulers.types";

/**
 * One ruler (the top one measures x, the left one y), drawn on a canvas at the screen's pixel
 * density. A press drags a new guide out of it: horizontal from the top ruler, vertical from the
 * left one.
 */
export function RulerStrip({ axis, version, colors }: RulerStripProps) {
  const engine = useEngine();
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef<GuideDragHandle | null>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setLength(axis === "x" ? width : height);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [axis]);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g || length <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const [w, h] = axis === "x" ? [length, RULER_SIZE] : [RULER_SIZE, length];
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Values count from the frame the rulers measure (e.g. the selected layers'), numbered
    // only along it.
    const frame = engine.rulerFrame();
    const origin = frame ? frame[axis] : 0;
    const span = frame ? ([0, axis === "x" ? frame.w : frame.h] as const) : null;
    const view = engine.visibleWorldRect();
    const bounds = engine.selectionBounds();
    const selection = bounds
      ? axis === "x"
        ? ([bounds.x - origin, bounds.x + bounds.w - origin] as const)
        : ([bounds.y - origin, bounds.y + bounds.h - origin] as const)
      : null;
    const start = (axis === "x" ? view.x : view.y) - origin;
    const zoom = engine.getState().zoom;
    drawRuler(g, { axis, length, start, zoom, span, selection, colors });
  }, [engine, axis, length, version, colors]);

  return (
    <canvas
      ref={ref}
      className={
        axis === "x"
          ? "absolute top-0 left-0 block h-5 w-full cursor-row-resize"
          : "absolute top-0 left-0 block h-full w-5 cursor-col-resize"
      }
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        // The top ruler gives horizontal guides (a y value), the left one vertical ones.
        drag.current = engine.beginGuideDrag(axis === "x" ? "y" : "x", event.nativeEvent);
        if (drag.current) event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => drag.current?.move(event.nativeEvent)}
      onPointerUp={() => {
        drag.current?.end();
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current?.end();
        drag.current = null;
      }}
    />
  );
}
