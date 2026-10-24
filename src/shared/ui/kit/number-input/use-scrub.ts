import { useRef, useState } from "react";

import { clampNumber, roundTo } from "./round-to";
import type { ScrubHandlers, ScrubOptions } from "./number-input.types";

/** Pixels the pointer moves before a press on the prefix scrubs instead of focusing. */
const SCRUB_THRESHOLD_PX = 3;

/**
 * Figma's scrubbing: press the prefix and drag sideways, right adds and left takes away (Shift:
 * ten times as fast). The pointer is locked once the drag starts, so it can go on past the
 * screen's edge; a press that doesn't move focuses the input instead.
 */
export function useScrub({
  value,
  min,
  max,
  scrubStep,
  factor,
  decimals,
  disabled,
  onChange,
  onStart,
  onEnd,
  onClick,
}: ScrubOptions): ScrubHandlers {
  const [scrubbing, setScrubbing] = useState(false);
  const drag = useRef<{ start: number; dx: number; moved: boolean; last: number } | null>(null);

  const finish = (target: Element, cancelled: boolean) => {
    const state = drag.current;
    drag.current = null;
    if (document.pointerLockElement === target) document.exitPointerLock();
    if (!state?.moved) return;
    setScrubbing(false);
    if (!cancelled) onChange(state.last, { done: true });
    onEnd?.();
  };

  return {
    scrubbing,
    handlers: {
      onPointerDown: (event) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const start = value ?? 0;
        drag.current = { start, dx: 0, moved: false, last: start };
      },
      onPointerMove: (event) => {
        const state = drag.current;
        if (!state || value === null) return;
        state.dx += event.movementX;
        if (!state.moved) {
          if (Math.abs(state.dx) < SCRUB_THRESHOLD_PX) return;
          state.moved = true;
          setScrubbing(true);
          onStart?.();
          const target = event.currentTarget;
          // Locking can be refused (no support, a lost gesture): the drag works without it.
          void Promise.resolve(target.requestPointerLock?.()).catch(() => undefined);
        }
        const delta = (state.dx * scrubStep * (event.shiftKey ? 10 : 1)) / factor;
        // Rounded as shown (a percentage to whole percents), then stored.
        const next = clampNumber(
          roundTo((state.start + delta) * factor, decimals) / factor,
          min,
          max,
        );
        if (next === state.last) return;
        state.last = next;
        onChange(next, { done: false });
      },
      onPointerUp: (event) => {
        const moved = drag.current?.moved;
        finish(event.currentTarget, false);
        if (!moved) onClick();
      },
      onPointerCancel: (event) => finish(event.currentTarget, true),
    },
  };
}
