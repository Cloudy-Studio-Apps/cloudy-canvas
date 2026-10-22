import {
  GOOGLE_CATALOG_URL,
  GOOGLE_FALLBACK_FAMILIES,
  googleFontCssUrl,
  parseFontFaceCss,
  parseGoogleCatalog,
  type FontFamily,
  type FontRequest,
} from "@shared/core";
import { http } from "../http";
import { fontCache } from "./font-cache";

/** The catalog is read again after this long. */
const CATALOG_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CATALOG_FILE = "google/catalog.json";

/**
 * Google's families: the cached catalog while it's fresh, otherwise downloaded (and cached), the
 * stale cache when offline, or a short list of popular families on a first run without network.
 */
export async function googleFonts(): Promise<FontFamily[]> {
  const cached = await readCatalog();
  if (cached && Date.now() - cached.savedAt < CATALOG_MAX_AGE_MS) return cached.families;
  try {
    const families = parseGoogleCatalog(await http.getText(GOOGLE_CATALOG_URL));
    if (families.length > 0) {
      await fontCache.writeText(CATALOG_FILE, JSON.stringify({ savedAt: Date.now(), families }));
      return families;
    }
  } catch {
    // Offline or Google changed the format: what's cached (or the fallback) still works.
  }
  return cached?.families ?? [...GOOGLE_FALLBACK_FAMILIES];
}

/**
 * Registers one face of a Google family with the document (`FontFace`), downloading its files
 * the first time and reading them from the cache afterwards. Resolves when it can be drawn.
 */
export async function loadGoogleFont(request: FontRequest): Promise<boolean> {
  const folder = `google/${slug(request.family)}/${request.weight}${request.style === "italic" ? "i" : ""}`;
  const css =
    (await fontCache.readText(`${folder}/face.css`)) ??
    (await download(`${folder}/face.css`, () =>
      http.getText(googleFontCssUrl(request.family, request)),
    ));
  const sources = parseFontFaceCss(css);
  if (sources.length === 0) return false;
  const faces = await Promise.all(
    sources.map(async (source, i) => {
      const name = `${folder}/${i}.font`;
      const data =
        (await fontCache.readBytes(name)) ??
        (await download(name, () => http.getBytes(source.url), true));
      if (!data) return null;
      const face = new FontFace(request.family, data as Uint8Array<ArrayBuffer>, {
        weight: request.weight,
        style: request.style,
        ...(source.unicodeRange ? { unicodeRange: source.unicodeRange } : {}),
      });
      document.fonts.add(await face.load());
      return face;
    }),
  );
  return faces.some((face) => face !== null);
}

async function readCatalog(): Promise<{ savedAt: number; families: FontFamily[] } | null> {
  try {
    const text = await fontCache.readText(CATALOG_FILE);
    return text ? (JSON.parse(text) as { savedAt: number; families: FontFamily[] }) : null;
  } catch {
    return null;
  }
}

/** Fetches a file and keeps it in the cache under `name`. */
async function download<T extends string | Uint8Array | null>(
  name: string,
  fetch: () => Promise<T>,
  binary = false,
): Promise<T> {
  const data = await fetch();
  if (data !== null) {
    if (binary) await fontCache.writeBytes(name, data as Uint8Array);
    else await fontCache.writeText(name, data as string);
  }
  return data;
}

/** A family name as a folder name. */
function slug(family: string): string {
  return family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
