import { invoke, isTauri } from "@tauri-apps/api/core";

import { nearestWeight, sortVariants, type FontFamily } from "@shared/core";
import type { SystemFont } from "./font-cache.types";

/** The computer's font families with their faces (none in the browser). */
export async function installedFonts(): Promise<FontFamily[]> {
  if (!isTauri()) return [];
  const faces = await invoke<SystemFont[]>("system_fonts");
  const byFamily = new Map<string, FontFamily>();
  for (const face of faces) {
    let family = byFamily.get(face.family);
    if (!family) {
      family = { family: face.family, source: "installed", variants: [] };
      byFamily.set(face.family, family);
    }
    family.variants.push({
      weight: nearestWeight(face.weight),
      style: face.italic ? "italic" : "normal",
    });
  }
  return [...byFamily.values()]
    .map((family) => ({ ...family, variants: sortVariants(family.variants) }))
    .sort((a, b) => a.family.localeCompare(b.family));
}
