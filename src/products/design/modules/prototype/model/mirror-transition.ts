import type { PrototypeAnimation, PrototypeTransition } from "./interaction.types";

const MIRROR: Partial<Record<PrototypeAnimation, PrototypeAnimation>> = {
  "move-in": "move-out",
  "move-out": "move-in",
  "slide-in": "slide-out",
  "slide-out": "slide-in",
};

/** The transition played backwards: `move-in` and `slide-in` become `-out` and vice versa; others stay. */
export function mirrorTransition(t: PrototypeTransition): PrototypeTransition {
  return { ...t, animation: MIRROR[t.animation] ?? t.animation };
}
