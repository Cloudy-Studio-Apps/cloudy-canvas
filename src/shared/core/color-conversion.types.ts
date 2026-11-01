/** How colors a press can't reach are brought in: kept exact where they can be, or eased. */
export type RenderingIntent = "relative" | "perceptual";

/** A print profile (`.icc`) that's been read. */
export interface PrintProfileInfo {
  /** Its description, e.g. "Coated FOGRA39". */
  name: string;
}

/** Turns sRGB into a press's CMYK, through its profile. */
export interface ColorConverter {
  /** Interleaved RGB bytes to interleaved CMYK bytes (255 is full ink). */
  rgbToCmyk(rgb: Uint8Array): Uint8Array;
  /** Frees it. */
  close(): void;
}

/**
 * Color management, as `canvas/` sees it: loaded only when a file goes to press. Implemented in
 * `platform/`.
 */
export interface ColorConversion {
  /** Throws with a message for the user when `profile` isn't a CMYK print profile. */
  readProfile(profile: Uint8Array): Promise<PrintProfileInfo>;
  converter(profile: Uint8Array, intent: RenderingIntent): Promise<ColorConverter>;
}
