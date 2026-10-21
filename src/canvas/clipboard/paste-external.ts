import { createId } from "@shared/core";

import type { CanvasElement } from "../elements";
import { rectCenter } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import { isSvg, svgSize } from "../render/svg-image";
import type { ElementClipboardHost } from "./element-clipboard.types";
import type { ExternalElement, PastedImage } from "./paste-external.types";

/**
 * Pastes an image file from outside the app through the product's `pasteImage`: the file becomes
 * a document asset and the element showing it is selected. It's centered in the view, or on `at`.
 * Returns `false` when the product doesn't take images or the file isn't an image it can decode.
 */
export async function pasteImage<O extends object>(
  host: ElementClipboardHost<O>,
  file: Blob,
  at?: Point,
): Promise<boolean> {
  const data = new Uint8Array(await file.arrayBuffer());
  const visible = host.visibleRect();
  const view = at ? { ...visible, x: at.x - visible.w / 2, y: at.y - visible.h / 2 } : visible;
  const built = await buildImage(host, data, view, host.doc.nextIndex());
  if (!built) return false;
  addExternal(host, [built]);
  return true;
}

/**
 * Pastes text from outside the app through the product's `pasteText`, centered in the view or on
 * `at`. Returns `false` when the product doesn't take it.
 */
export function pasteText<O extends object>(
  host: ElementClipboardHost<O>,
  text: string,
  at?: Point,
): boolean {
  const el = buildText(host, text, at ?? rectCenter(host.visibleRect()), host.doc.nextIndex());
  if (el) addExternal(host, [{ el }]);
  return el !== null;
}

/**
 * The product's element for an image file (raster or SVG), fit and centered in `view`, with the
 * new asset holding the file; `null` when the product doesn't take images or it can't be decoded.
 */
export async function buildImage<O extends object>(
  host: ElementClipboardHost<O>,
  data: Uint8Array,
  view: Rect,
  index: string,
): Promise<ExternalElement | null> {
  const { product } = host;
  if (!product.pasteImage) return null;
  const size = await imageSize(data);
  if (!size) return null;
  const image: PastedImage = { assetId: createId(), ...size };
  const el = product.pasteImage(image, view, index, host.getOptions());
  return el ? { el, asset: { id: image.assetId, data } } : null;
}

/** The product's element for text, centered on `at`; `null` when it doesn't take it. */
export function buildText<O extends object>(
  host: ElementClipboardHost<O>,
  text: string,
  at: Point,
  index: string,
): CanvasElement | null {
  return host.product.pasteText?.(text, at, index, host.getOptions()) ?? null;
}

/** Adds the elements and their assets as one undo step and selects them. */
export function addExternal<O extends object>(
  host: ElementClipboardHost<O>,
  added: readonly ExternalElement[],
): void {
  if (added.length === 0) return;
  const { doc } = host;
  for (const { asset } of added) if (asset) doc.addAsset(asset.id, asset.data);
  doc.checkpoint();
  doc.batch(() => {
    for (const { el } of added) doc.add(el);
  });
  host.select(added.map(({ el }) => el.id));
}

async function imageSize(data: Uint8Array): Promise<Pick<PastedImage, "width" | "height"> | null> {
  if (isSvg(data)) return svgSize(data);
  try {
    const bitmap = await createImageBitmap(new Blob([data as Uint8Array<ArrayBuffer>]));
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  }
}
