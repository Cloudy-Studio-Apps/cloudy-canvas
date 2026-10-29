import { CanvasDocument, composeProduct, type CanvasElement, type ElementKinds } from "@canvas";
import { boardCanvas } from "@board";
import { viewerPlaceholder, type ViewerFile } from "@board/modules/viewer";
import { boardViewerParts } from "@board/modules/viewer/ui";
import { createModuleHost } from "@shared/core";
import { BOARD_VIEWER_MODULES } from "./board-viewer-modules";
import type { ViewerBoard } from "./open-viewer-board.types";
import { activateViewerPlugins } from "./viewer-plugins";

/**
 * The board `file` carries: the built-in modules' canvas side plus its plugins' viewer modules,
 * composed like the app's board, and a document holding its assets and elements. The elements of
 * a plugin that failed here show as placeholders.
 */
export async function openViewerBoard(file: ViewerFile): Promise<ViewerBoard> {
  const { modules, failed } = await activateViewerPlugins(file.plugins);
  const pluginOf = (moduleId: string) =>
    file.plugins.find((p) => moduleId === p.id || moduleId.startsWith(`${p.id}.`));
  const pluginIds = new Set(modules.map((module) => module.id));
  const host = createModuleHost([...BOARD_VIEWER_MODULES, ...modules], {
    isOptional: (module) => pluginIds.has(module.id),
    onError: (module, error) => {
      console.error(`[viewer] "${module.id}" was left out:`, error);
      const plugin = pluginOf(module.id);
      if (plugin) failed.add(plugin.id);
    },
  });
  const product = composeProduct("board", host, boardCanvas);

  const document = new CanvasDocument(product.kinds);
  for (const [id, url] of Object.entries(file.assets)) document.addAsset(id, dataUrlBytes(url));
  for (const el of withPlaceholders(file, failed, product.kinds, document)) {
    document.addUntracked(el);
  }
  return { product, document, parts: host.get(boardViewerParts) };
}

/**
 * The file's elements, with placeholders for those nothing here draws: a plugin in `failed`, or
 * a type its viewer modules didn't register.
 */
function withPlaceholders(
  file: ViewerFile,
  failed: ReadonlySet<string>,
  kinds: ElementKinds,
  document: CanvasDocument,
): CanvasElement[] {
  const owners = new Map<string, { id: string; name: string }>();
  for (const plugin of file.plugins) for (const type of plugin.types) owners.set(type, plugin);
  return file.elements.map((el) => {
    const owner = owners.get(el.type);
    const drawn = kinds.has(el.type) && !(owner && failed.has(owner.id));
    if (drawn) return el;
    const name = owner?.name ?? el.type;
    const placeholder = viewerPlaceholder(el, name);
    document.addAsset(placeholder.assetId, new TextEncoder().encode(placeholder.svg));
    return placeholder.element;
  });
}

function dataUrlBytes(url: string): Uint8Array {
  const base64 = url.slice(url.indexOf(",") + 1);
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
