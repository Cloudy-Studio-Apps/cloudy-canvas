import type { FigImportContext } from "@canvas/figma";
import type en from "./locales/en.json";

/** A loss the Figma import counts: a key of `warnings` in `locales/en.json`. */
export type FigmaWarning = keyof (typeof en)["warnings"];

/** What converting a Figma file's nodes shares, its losses as `FigmaWarning`s. */
export type FigmaContext = FigImportContext<FigmaWarning>;
