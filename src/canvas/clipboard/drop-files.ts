import { extensionOf, imageTypeFromName, type DroppedFile } from "@shared/core";

import type { CanvasElement } from "../elements";
import { rectCenter } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import type { ImportFile } from "../model3d/model3d.types";
import { isSvg } from "../render/svg-image";
import type { DropResult } from "./drop-files.types";
import type { ElementClipboardHost } from "./element-clipboard.types";
import { PASTE_STEP } from "./paste-offset";
import { addExternal, buildImage, buildText } from "./paste-external";
import type { ExternalElement } from "./paste-external.types";

/** Text files dropped files become text from, by extension. */
const TEXT_EXTENSIONS = new Set(["txt"]);

/**
 * Adds files dropped on the canvas at `at` (world units), as pasting would. The product's
 * `importFiles` hooks go first and take what they recognize (a 3D model with its textures; names
 * they claim are left out of the rest, cancelled ones included, so they aren't reported skipped).
 * Of the rest, images and SVGs go through `pasteImage`, `.txt` files through `pasteText`. Each
 * next file lands a paste step further; they're added as one undo step and selected.
 */
export async function dropFiles<O extends object>(
  host: ElementClipboardHost<O>,
  files: readonly DroppedFile[],
  at: Point,
): Promise<DropResult> {
  const read = await Promise.all(files.map((file) => readSafely(file)));
  // The first block of indexes is the rest's, one per file; the second is for the hooks.
  const indexes = host.doc.nextIndexes(files.length * 2);
  const view = host.visibleRect();
  let spare = files.length;
  const imported = await runImporters(host, files, read, centeredOn(view, at), () => {
    const index = indexes[spare++];
    if (index === undefined) throw new Error("No z-order index left for an imported file");
    return index;
  });
  const built: ExternalElement[] = imported.elements.map((el) => ({ el }));
  const skipped: string[] = [];
  for (const [i, file] of files.entries()) {
    if (imported.claimed.has(file.name)) continue;
    const data = read[i];
    const step = built.length * PASTE_STEP;
    const point = { x: at.x + step, y: at.y + step };
    const el = data
      ? await buildFile(host, file.name, data, centeredOn(view, point), indexes[i])
      : null;
    if (el) built.push(el);
    else skipped.push(file.name);
  }
  addExternal(host, built);
  return { added: built.map(({ el }) => el.id), skipped };
}

/**
 * Runs the product's `importFiles` hooks over the readable files, each on what the ones before
 * left: the elements they made and the names they claimed.
 */
async function runImporters<O extends object>(
  host: ElementClipboardHost<O>,
  files: readonly DroppedFile[],
  read: readonly (Uint8Array | null)[],
  view: Rect,
  nextIndex: () => string,
): Promise<{ elements: CanvasElement[]; claimed: Set<string> }> {
  const elements: CanvasElement[] = [];
  const claimed = new Set<string>();
  for (const hook of host.product.importFiles ?? []) {
    const left: ImportFile[] = [];
    for (const [i, file] of files.entries()) {
      const data = read[i];
      if (data && !claimed.has(file.name)) left.push({ name: file.name, path: file.path, data });
    }
    if (left.length === 0) break;
    const result = await hook({ files: left, view, doc: host.doc, nextIndex });
    elements.push(...result.elements);
    for (const name of result.claimed) claimed.add(name);
  }
  return { elements, claimed };
}

async function buildFile<O extends object>(
  host: ElementClipboardHost<O>,
  name: string,
  data: Uint8Array,
  view: Rect,
  index: string | undefined,
): Promise<ExternalElement | null> {
  if (index === undefined) return null;
  if (TEXT_EXTENSIONS.has(extensionOf(name))) {
    const el = buildText(host, new TextDecoder().decode(data), rectCenter(view), index);
    return el ? { el } : null;
  }
  if (!imageTypeFromName(name) && !isSvg(data)) return null;
  return buildImage(host, data, view, index);
}

/** The view moved so its center is `p`: images fit in the view and land on the drop point. */
function centeredOn(view: Rect, p: Point): Rect {
  return { x: p.x - view.w / 2, y: p.y - view.h / 2, w: view.w, h: view.h };
}

async function readSafely(file: DroppedFile): Promise<Uint8Array | null> {
  try {
    return await file.read();
  } catch (error) {
    console.warn(`[drop] Couldn't read ${file.name}:`, error);
    return null;
  }
}
