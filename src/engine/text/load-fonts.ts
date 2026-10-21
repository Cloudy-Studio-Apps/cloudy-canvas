import { elementKinds } from "../elements";
import { fontString } from "./text-metrics";

/** Waits for the canvas fonts so the first render measures and draws text correctly. */
export async function loadFonts(): Promise<void> {
  // Every font size an element type starts with, so new text never waits on a font.
  const sizes = new Set<number>();
  for (const kind of elementKinds.all()) {
    if (kind.defaults.fontSize) sizes.add(kind.defaults.fontSize);
  }
  try {
    await Promise.all([...sizes].map((size) => document.fonts.load(fontString(size))));
  } catch {
    // Fall back to system fonts.
  }
}
