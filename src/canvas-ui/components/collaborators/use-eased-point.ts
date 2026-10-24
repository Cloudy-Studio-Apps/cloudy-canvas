import { useEffect, useRef, useState } from "react";

import type { Point } from "@canvas";

const DURATION_MS = 450;

function reducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Follows `target` with a short ease-out glide (a jump with reduced motion). */
export function useEasedPoint(target: Point): Point {
  const [point, setPoint] = useState(target);
  const pointRef = useRef(target);

  useEffect(() => {
    const from = pointRef.current;
    if ((from.x === target.x && from.y === target.y) || reducedMotion()) {
      pointRef.current = target;
      setPoint(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function step(time) {
      const t = Math.min(1, (time - start) / DURATION_MS);
      const k = 1 - (1 - t) ** 3;
      const next = { x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k };
      pointRef.current = next;
      setPoint(next);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target.x, target.y]); // eslint-disable-line react-hooks/exhaustive-deps

  return point;
}
