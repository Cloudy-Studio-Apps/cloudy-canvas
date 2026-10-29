import { fontKey, type FontLoader } from "@shared/core";
import type { ViewerFont } from "../../viewer-file.types";

/**
 * Loads the font faces the file carries, each once, when the board's text asks for them. Faces
 * the file doesn't carry resolve `false` (the text falls back to what the browser has).
 */
export function embeddedFontLoader(fonts: readonly ViewerFont[]): FontLoader {
  const faces = new Map(fonts.map((font) => [fontKey(font.request), font]));
  const loads = new Map<string, Promise<boolean>>();
  return {
    load(request) {
      const key = fontKey(request);
      const font = faces.get(key);
      if (!font) return Promise.resolve(false);
      let load = loads.get(key);
      if (!load) {
        const bytes = Uint8Array.from(atob(font.data), (c) => c.charCodeAt(0));
        const face = new FontFace(request.family, bytes, {
          style: request.style,
          weight: String(request.weight),
        });
        load = face.load().then(
          (loaded) => (document.fonts.add(loaded), true),
          () => false,
        );
        loads.set(key, load);
      }
      return load;
    },
  };
}
