import type { CanvasElement, CanvasEngine } from "@canvas";
import { fontLibrary } from "@platform";
import { fontKey, type FontRequest } from "@shared/core";
import type { ViewerFont } from "../../viewer-file.types";
import { bytesToBase64 } from "./bytes-to-base64";

/**
 * The font faces the elements' text uses, when the app can hand over their files (installed
 * and Google fonts). The app's own fonts come with the viewer; others fall back in the browser.
 */
export async function collectFonts(
  engine: CanvasEngine,
  elements: readonly CanvasElement[],
): Promise<ViewerFont[]> {
  const requests = new Map<string, FontRequest>();
  for (const el of elements) {
    const kind = engine.kinds.get(el.type);
    for (const request of kind?.fonts(el) ?? []) requests.set(fontKey(request), request);
  }
  const fonts: ViewerFont[] = [];
  for (const request of requests.values()) {
    const data = await fontLibrary.fontData(request).catch(() => null);
    if (data && data.index === 0) fonts.push({ request, data: bytesToBase64(data.bytes) });
  }
  return fonts;
}
