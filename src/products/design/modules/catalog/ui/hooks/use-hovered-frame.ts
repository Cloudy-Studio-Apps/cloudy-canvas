import { useEffect, useState } from "react";

import { rectContainsPoint } from "@canvas";
import type { FrameElement } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";

/**
 * The frame among `frames` under the pointer, by where it is on the canvas (so it stays while the
 * pointer is over DOM drawn on the frame, e.g. its buttons); `null` elsewhere.
 */
export function useHoveredFrame(frames: readonly FrameElement[]): string | null {
  const engine = useDesignEngine();
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const world = engine.clientToWorld({ x: event.clientX, y: event.clientY });
        // The topmost frame, should two overlap.
        const hit = world && [...frames].reverse().find((item) => rectContainsPoint(item, world));
        setHovered(hit ? hit.id : null);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [engine, frames]);

  return hovered;
}
