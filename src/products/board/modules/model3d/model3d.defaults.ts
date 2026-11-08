import type { ElementDefaults } from "@canvas";

/** A model has no style of its own; its view (angle, zoom) is set in the panel or by agents. */
export const MODEL_DEFAULTS = {} as const satisfies ElementDefaults;

/** The fields agents may patch (x, y, w, h move and resize it; angle and zoom are validated). */
export const MODEL_PATCHABLE_FIELDS: ReadonlySet<string> = new Set([
  "x",
  "y",
  "w",
  "h",
  "angle",
  "zoom",
]);
