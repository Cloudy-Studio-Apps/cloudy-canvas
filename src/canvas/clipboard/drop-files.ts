import { extensionOf, imageTypeFromName, type DroppedFile } from "@shared/core";

import { rectCenter } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import { isSvg } from "../render/svg-image";
import type { DropResult } from "./drop-files.types";
import type { ElementClipboardHost } from "./element-clipboard.types";
import { PASTE_STEP } from "./paste-offset";
import { addExternal, buildImage, buildText } from "./paste-external";
import type { ExternalElement } from "./paste-external.types";

/** Text files dropped files become text from, by extension. */
const TEXT_EXTENSIONS = new Set(["txt"]);

/**
 * Adds files dropped on the canvas at `at` (world units), as pasting would: images and SVGs
 * through the product's `pasteImage`, `.txt` files through its `pasteText`. Each next file lands
 * a paste step further; they're added as one undo step and selected.
 */
export async function dropFiles<O extends object>(
  host: ElementClipboardHost<O>,
  files: readonly DroppedFile[],
  at: Point,
): Promise<DropResult> {
  const read = await Promise.all(files.map((file) => readSafely(file)));
  const indexes = host.doc.nextIndexes(files.length);
  const view = host.visibleRect();
  const built: ExternalElement[] = [];
  const skipped: string[] = [];
  for (const [i, file] of files.entries()) {
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
