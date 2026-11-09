import type { FontLoader, FontRequest } from "@shared/core";
import type { CanvasDocument } from "../document";
import type { ElementKinds } from "../elements";
import { FontTracker } from "./font-tracker";
import { loadFonts } from "./load-fonts";
import { fontsChanged } from "./rich/font-metrics";

/** The faces a document's elements ask for (`ElementKind.fonts`). */
export function documentFonts(doc: CanvasDocument, kinds: ElementKinds): FontRequest[] {
  return doc.all().flatMap((el) => kinds.kindOf(el).fonts(el));
}

/**
 * Loads fonts as an engine opening a file does (`loadFonts` for the kinds' default sizes, then
 * each face asked for, once, through a `FontTracker` and `loader`), waits until each has loaded
 * or failed, then drops the cached font metrics and layouts (`fontsChanged`), so text measured
 * earlier with fallback fonts is measured again. For work on a document without an engine (text
 * measured by the after-edit hook). A face that can't be loaded falls back as in an editor.
 */
export async function loadDocumentFonts(
  kinds: ElementKinds,
  loader: FontLoader,
  fonts: Iterable<FontRequest>,
): Promise<void> {
  const tracker = new FontTracker(loader, () => undefined);
  tracker.request(fonts);
  await Promise.all([loadFonts(kinds), tracker.settled()]);
  tracker.destroy();
  // What was measured before (with fallback fonts) is measured again, as the engine does on a load.
  fontsChanged();
}
