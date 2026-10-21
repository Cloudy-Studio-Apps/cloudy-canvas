import { STICKY_FONT_SIZE, TEXT_FONT_SIZE } from "../document";
import { fontString } from "./text-metrics";

/** Waits for the canvas fonts so the first render measures and draws text correctly. */
export async function loadFonts(): Promise<void> {
  try {
    await Promise.all(
      [STICKY_FONT_SIZE, TEXT_FONT_SIZE].map((size) => document.fonts.load(fontString(size))),
    );
  } catch {
    // Fall back to system fonts.
  }
}
