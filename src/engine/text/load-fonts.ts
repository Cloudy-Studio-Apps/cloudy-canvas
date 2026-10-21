import { GEO_FONT_SIZE, STICKY_FONT_SIZE } from "../elements";
import { fontString } from "./text-metrics";

/** Waits for the canvas fonts so the first render measures and draws text correctly. */
export async function loadFonts(): Promise<void> {
  try {
    const sizes = new Set([STICKY_FONT_SIZE, GEO_FONT_SIZE]);
    await Promise.all([...sizes].map((size) => document.fonts.load(fontString(size))));
  } catch {
    // Fall back to system fonts.
  }
}
