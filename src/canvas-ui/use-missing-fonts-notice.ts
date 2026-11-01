import { useEffect } from "react";

import type { CanvasEngine } from "@canvas";
import { fontLibrary } from "@platform";
import { toast } from "@shared/stores/toast-store";
import { t } from "./canvas-ui.i18n";

/** How many missing fonts the notice names. */
const NAMED = 3;

/**
 * Tells the user once per file when it uses fonts this computer doesn't have: they show in a
 * fallback font, which measures differently, so text may shift.
 */
export function useMissingFontsNotice<O extends object>(engine: CanvasEngine<O> | null): void {
  useEffect(() => {
    if (!engine) return;
    let current = true;
    void missingFonts(engine).then((names) => {
      if (!current || names.length === 0) return;
      const shown = names.slice(0, NAMED).join(", ");
      const rest = names.length - NAMED;
      toast({
        title: t("fonts.missing.title"),
        description: t("fonts.missing.description", {
          names: rest > 0 ? `${shown} +${rest}` : shown,
        }),
      });
    });
    return () => {
      current = false;
    };
  }, [engine]);
}

async function missingFonts<O extends object>(engine: CanvasEngine<O>): Promise<string[]> {
  const used = new Set<string>();
  for (const el of engine.doc.all()) {
    for (const { family } of engine.kinds.kindOf(el).fonts(el)) {
      // A list of families is the app's default stack, which always ends in a system font.
      if (!family.includes(",")) used.add(family);
    }
  }
  if (used.size === 0) return [];
  const library = await fontLibrary.families();
  // Without both lists (the browser, or no network) any font could look missing.
  if (!library.some((font) => font.source === "installed")) return [];
  if (!library.some((font) => font.source === "google")) return [];
  const known = new Set(library.map((font) => font.family));
  // The fonts the app brings with it.
  document.fonts.forEach((face) => known.add(face.family.replace(/^["']|["']$/g, "")));
  return [...used].filter((family) => !known.has(family)).sort();
}
