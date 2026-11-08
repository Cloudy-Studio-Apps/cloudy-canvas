import type {
  PrototypeAnimation,
  PrototypeDirection,
  PrototypeTransition,
} from "./interaction.types";

const MIRROR: Partial<Record<PrototypeAnimation, PrototypeAnimation>> = {
  "move-in": "move-out",
  "move-out": "move-in",
  "slide-in": "slide-out",
  "slide-out": "slide-in",
};

const OPPOSITE: Record<PrototypeDirection, PrototypeDirection> = {
  left: "right",
  right: "left",
  up: "down",
  down: "up",
};

/**
 * The transition played backwards: the direction flips (left/right, up/down), and `move-in` and
 * `slide-in` become `-out` and vice versa; `push`, `dissolve` and `instant` keep their animation.
 */
export function mirrorTransition(t: PrototypeTransition): PrototypeTransition {
  return { ...t, animation: MIRROR[t.animation] ?? t.animation, direction: OPPOSITE[t.direction] };
}
