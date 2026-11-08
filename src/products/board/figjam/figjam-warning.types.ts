import type en from "./locales/en.json";

/** A loss the FigJam import counts: a key of `warnings` in `locales/en.json`. */
export type FigJamWarning = keyof (typeof en)["warnings"];
