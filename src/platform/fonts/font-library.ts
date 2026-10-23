import { fontKey, type FontFamily, type FontLibrary, type FontRequest } from "@shared/core";
import { googleFontFile, googleFonts, loadGoogleFont } from "./google-fonts";
import { installedFontData, installedFonts } from "./installed-fonts";

let families: Promise<FontFamily[]> | null = null;
const loads = new Map<string, Promise<boolean>>();

/**
 * The fonts the design editor offers: the computer's installed families, then Google Fonts (each
 * face downloaded once and cached in the app data folder). Each face is loaded once per session.
 */
export const fontLibrary: FontLibrary = {
  families() {
    families ??= Promise.all([
      installedFonts().catch(() => []),
      googleFonts().catch(() => []),
    ]).then(([installed, google]) => {
      const names = new Set(installed.map((family) => family.family));
      // An installed family wins over Google's copy of it.
      return [...installed, ...google.filter((family) => !names.has(family.family))];
    });
    return families;
  },
  async fontData(request) {
    const family = (await fontLibrary.families()).find((item) => item.family === request.family);
    if (family?.source !== "google") {
      const installed = await installedFontData(request).catch(() => null);
      if (installed) return installed;
    }
    const bytes = await googleFontFile(request).catch(() => null);
    return bytes ? { bytes, index: 0 } : null;
  },
  load(request) {
    const key = fontKey(request);
    let load = loads.get(key);
    if (!load) {
      load = loadFont(request).catch(() => false);
      loads.set(key, load);
    }
    return load;
  },
};

async function loadFont(request: FontRequest): Promise<boolean> {
  const family = (await fontLibrary.families()).find((item) => item.family === request.family);
  if (family?.source === "google") return loadGoogleFont(request);
  // Installed (or unknown) families are drawn by name; wait until the browser has the face.
  const css = `${request.style} ${request.weight} 16px "${request.family}"`;
  await document.fonts.load(css);
  return document.fonts.check(css);
}
