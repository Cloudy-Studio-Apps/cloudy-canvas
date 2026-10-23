import { invoke, isTauri } from "@tauri-apps/api/core";

import {
  nearestWeight,
  sortVariants,
  type FontData,
  type FontFamily,
  type FontRequest,
} from "@shared/core";
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

/**
 * An installed face's file, for outlining its glyphs (the Rust side answers the face's index in
 * its file as four little-endian bytes, then the file); `null` when it isn't installed.
 */
export async function installedFontData(request: FontRequest): Promise<FontData | null> {
  if (!isTauri()) return null;
  const response = await invoke<ArrayBuffer>("system_font_data", {
    family: request.family,
    weight: Number(request.weight),
    italic: request.style === "italic",
  });
  if (response.byteLength <= 4) return null;
  const index = new DataView(response).getUint32(0, true);
  return { bytes: new Uint8Array(response, 4), index };
}
