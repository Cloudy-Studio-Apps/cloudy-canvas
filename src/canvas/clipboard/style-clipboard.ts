import type { ElementStyle } from "../elements/element.types";

/** The look Copy properties took last, per product, for every file of this app session. */
const copied = new Map<string, ElementStyle>();

/** What Paste properties applies in the product's files, or `null` before anything is copied. */
export function copiedStyle(productId: string): ElementStyle | null {
  return copied.get(productId) ?? null;
}

export function setCopiedStyle(productId: string, style: ElementStyle): void {
  copied.set(productId, style);
}
