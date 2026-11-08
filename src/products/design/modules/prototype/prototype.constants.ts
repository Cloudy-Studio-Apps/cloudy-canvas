import type {
  OverlayPosition,
  PrototypeAction,
  PrototypeAnimation,
  PrototypeDirection,
  PrototypeEasing,
  PrototypeTrigger,
} from "./model/interaction.types";
import type { PrototypePlatform } from "./model/flow.types";

/** The flow record's element type. */
export const PROTOTYPE_FLOW_TYPE = "prototype-flow";

/** Every trigger, as the panel and agents offer them. */
export const PROTOTYPE_TRIGGERS: readonly PrototypeTrigger[] = [
  "click",
  "hover",
  "press",
  "enter",
  "leave",
  "drag",
  "key",
  "delay",
];

/** Every action. */
export const PROTOTYPE_ACTIONS: readonly PrototypeAction[] = [
  "navigate",
  "back",
  "overlay",
  "swap",
  "close",
  "link",
];

/** The actions that show a screen, named by `to`. */
export const PROTOTYPE_TARGET_ACTIONS: readonly PrototypeAction[] = ["navigate", "overlay", "swap"];

/** The actions that show their screen as an overlay (they carry `overlay`). */
export const PROTOTYPE_OVERLAY_ACTIONS: readonly PrototypeAction[] = ["overlay", "swap"];

/** Every animation. */
export const PROTOTYPE_ANIMATIONS: readonly PrototypeAnimation[] = [
  "instant",
  "dissolve",
  "move-in",
  "move-out",
  "push",
  "slide-in",
  "slide-out",
];

/** Every direction. */
export const PROTOTYPE_DIRECTIONS: readonly PrototypeDirection[] = ["left", "right", "up", "down"];

/** Every easing. */
export const PROTOTYPE_EASINGS: readonly PrototypeEasing[] = [
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "spring",
];

/** Every overlay position. */
export const OVERLAY_POSITIONS: readonly OverlayPosition[] = ["top", "center", "bottom"];

/** Every platform. */
export const PROTOTYPE_PLATFORMS: readonly PrototypePlatform[] = [
  "mobile",
  "tablet",
  "desktop",
  "web",
];

/** The longest transition, in milliseconds. */
export const MAX_TRANSITION_DURATION = 5000;

/** The longest wait of a `delay` trigger, in milliseconds. */
export const MAX_TRIGGER_DELAY = 60000;

/** A screen wider than this (in canvas units) plays in a browser by default, else on a phone. */
export const WIDE_SCREEN_WIDTH = 600;

/** The Prototype mode's id (`engine.setMode`, `EngineState.mode`). */
export const PROTOTYPE_MODE_ID = "prototype";

/** The mode's tools (the connect tool arrives with the links). */
export const PROTOTYPE_TOOLS = {
  select: "prototype.select",
  connect: "prototype.connect",
} as const;

/** The mode's host commands (toggle works in every mode; play arrives with the player). */
export const PROTOTYPE_COMMANDS = {
  toggle: "prototype.toggle",
  addFlow: "prototype.addFlow",
  play: "prototype.play",
} as const;
