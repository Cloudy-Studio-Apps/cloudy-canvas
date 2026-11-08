import { createId } from "@shared/core";

import type {
  PrototypeInteraction,
  PrototypeOverlay,
  PrototypeTransition,
} from "./interaction.types";

/** A new interaction's transition. */
export const DEFAULT_TRANSITION: PrototypeTransition = Object.freeze({
  animation: "dissolve",
  direction: "left",
  duration: 300,
  easing: "ease-out",
});

/** A new overlay interaction's overlay. */
export const DEFAULT_OVERLAY: PrototypeOverlay = Object.freeze({
  position: "center",
  closeOutside: true,
  dim: true,
});

/** A new interaction: a click that navigates (to `to`, when given), with the default transition. */
export function newInteraction(to?: string): PrototypeInteraction {
  return {
    id: createId(),
    trigger: "click",
    action: "navigate",
    ...(to === undefined ? {} : { to }),
    transition: { ...DEFAULT_TRANSITION },
  };
}
