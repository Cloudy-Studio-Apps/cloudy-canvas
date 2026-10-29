import type { CanvasEngine } from "@canvas";
import { getLocale } from "@shared/core";
import type { ViewerFile } from "../../viewer-file.types";
import { collectAssets } from "./collect-assets";
import { collectElements } from "./collect-elements";
import { collectFonts } from "./collect-fonts";
import { collectParts } from "./collect-parts";
import { collectPlugins } from "./collect-plugins";
import { encodeViewerHtml } from "./encode-viewer-html";

/** The whole board as a read-only HTML file named `name` (see the viewer module's README). */
export async function exportBoardHtml(engine: CanvasEngine, name: string): Promise<Blob> {
  // The runtime is a few megabytes of HTML: loaded only when a board is exported.
  const { default: runtime } = await import("virtual:board-viewer-runtime");
  const { elements, placeholderSvgs, pluginTypes } = collectElements(engine);
  const meta = engine.doc.meta();
  const file: ViewerFile = {
    format: 1,
    appVersion: __APP_VERSION__,
    locale: getLocale(),
    // An untitled board goes by its file's name, as the app shows it.
    meta: { ...meta, title: meta.title || name },
    elements,
    assets: await collectAssets(engine, elements, placeholderSvgs),
    fonts: await collectFonts(engine, elements),
    parts: collectParts(engine.doc),
    plugins: collectPlugins(pluginTypes),
  };
  return encodeViewerHtml(runtime, file);
}
