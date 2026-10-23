import { useEffect, useRef, useState } from "react";

import { erDropPlan, type ErDrop } from "@board";
import { MOVE_THRESHOLD_PX, type Point } from "@canvas";
import { useEngine } from "@canvas-ui";
import { useErModel } from "../model";
import type { ErDragGhost, PaletteDrag, PaletteDragOptions } from "./er-palette.types";

/**
 * Drags a palette item onto the canvas with pointer events (not HTML drag and drop, which the
 * desktop shell keeps for files). A press released before it moves is a click; a drop runs the
 * item's `erDropPlan` where it lands and selects what it added. Esc cancels.
 */
export function usePaletteDrag({ item, diagram, onClick }: PaletteDragOptions): PaletteDrag {
  const engine = useEngine();
  const er = useErModel();
  const [ghost, setGhost] = useState<ErDragGhost | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  const planAt = (client: Point): { drop: ErDrop; world: Point | null } => {
    const world = engine.clientToWorld(client);
    if (!world) return { drop: { ok: false, label: "Drop on the board" }, world };
    const hit = engine.elementAt(world);
    return { drop: erDropPlan(item, hit && er.shape(hit.id), diagram.id), world };
  };

  const onPointerDown: PaletteDrag["onPointerDown"] = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY };
    let dragging = false;

    const move = (e: PointerEvent) => {
      const client = { x: e.clientX, y: e.clientY };
      if (!dragging && Math.hypot(client.x - start.x, client.y - start.y) < MOVE_THRESHOLD_PX) {
        return;
      }
      dragging = true;
      const { drop } = planAt(client);
      setGhost({ ...client, label: drop.label, ok: drop.ok });
    };
    const up = (e: PointerEvent) => {
      stop();
      if (!dragging) {
        onClick();
        return;
      }
      const { drop, world } = planAt({ x: e.clientX, y: e.clientY });
      if (!drop.ok || !world) return;
      const id = drop.run(er.diagram(drop.diagram).edits, world);
      if (id) engine.select([id]);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      stop();
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("keydown", key, true);
      cleanup.current = null;
      setGhost(null);
    };

    cleanup.current?.();
    cleanup.current = stop;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("keydown", key, true);
  };

  return { onPointerDown, ghost };
}
