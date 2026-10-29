import { useEffect, type RefObject } from "react";

import { MOVE_THRESHOLD_PX, type Point } from "@canvas";
import type { ViewerPart } from "../viewer-part.types";
import type { ViewerClicksOptions } from "./use-viewer-clicks.types";

/**
 * Clicks (a press and release without dragging) on an element a part handles run its `click` or
 * open its panel; over such an element the pointer is a hand that points.
 */
export function useViewerClicks(
  containerRef: RefObject<HTMLElement | null>,
  { engine, parts, onClick }: ViewerClicksOptions,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!engine || !container) return;

    const hit = (event: PointerEvent) => {
      const world = engine.clientToWorld({ x: event.clientX, y: event.clientY });
      const element = world ? engine.elementAt(world) : undefined;
      const part = element && parts.find((p: ViewerPart) => p.types.includes(element.type));
      return part && element ? { part, element } : null;
    };

    let down: Point | null = null;
    const onDown = (event: PointerEvent) => {
      down = event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
    };
    const onUp = (event: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
      down = null;
      const target = moved < MOVE_THRESHOLD_PX ? hit(event) : null;
      if (target) onClick(target.part, target.element);
    };
    // The engine sets the container's cursor (the hand); the canvas's own wins over it.
    const onMove = (event: PointerEvent) => {
      const canvas = container.querySelector("canvas");
      if (canvas && event.buttons === 0) canvas.style.cursor = hit(event) ? "pointer" : "";
    };

    container.addEventListener("pointerdown", onDown, true);
    container.addEventListener("pointerup", onUp, true);
    container.addEventListener("pointermove", onMove);
    return () => {
      container.removeEventListener("pointerdown", onDown, true);
      container.removeEventListener("pointerup", onUp, true);
      container.removeEventListener("pointermove", onMove);
    };
  }, [containerRef, engine, parts, onClick]);
}
