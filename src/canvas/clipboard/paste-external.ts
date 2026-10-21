import { createId } from "@shared/core";

import { rectCenter } from "../geometry";
import type { ElementClipboardHost } from "./element-clipboard.types";
import type { PastedImage } from "./paste-external.types";

/**
 * Pastes an image file from outside the app through the product's `pasteImage`: the file becomes
 * a document asset and the element showing it is selected. Returns `false` when the product
 * doesn't take images or the file isn't an image it can decode.
 */
export async function pasteImage<O extends object>(
  host: ElementClipboardHost<O>,
  file: Blob,
): Promise<boolean> {
  const { doc, product } = host;
  if (!product.pasteImage) return false;
  const size = await imageSize(file);
  if (!size) return false;
  const data = new Uint8Array(await file.arrayBuffer());
  const image: PastedImage = { assetId: createId(), ...size };
  const el = product.pasteImage(image, host.visibleRect(), doc.nextIndex(), host.getOptions());
  if (!el) return false;
  doc.addAsset(image.assetId, data);
  doc.checkpoint();
  doc.add(el);
  host.select([el.id]);
  return true;
}

/** Pastes text from outside the app through the product's `pasteText`, centered in the view. */
export function pasteText<O extends object>(host: ElementClipboardHost<O>, text: string): void {
  const { doc, product } = host;
  const el = product.pasteText?.(
    text,
    rectCenter(host.visibleRect()),
    doc.nextIndex(),
    host.getOptions(),
  );
  if (!el) return;
  doc.checkpoint();
  doc.add(el);
  host.select([el.id]);
}

async function imageSize(file: Blob): Promise<Pick<PastedImage, "width" | "height"> | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  }
}
