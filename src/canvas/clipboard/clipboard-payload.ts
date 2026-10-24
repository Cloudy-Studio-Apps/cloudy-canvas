import type { CanvasElement, ElementKinds } from "../elements";
import type { ClipboardPayload, DecodedClipboard } from "./clipboard-payload.types";

const FORMAT = "cloudy-canvas";
const VERSION = 1;

export function encodeClipboard(
  product: string,
  elements: readonly CanvasElement[],
  selected: Iterable<string>,
  assets: Record<string, string>,
  tokens: readonly unknown[] = [],
): string {
  const payload: ClipboardPayload = {
    format: FORMAT,
    version: VERSION,
    product,
    elements: [...elements],
    selected: [...selected],
    assets,
    ...(tokens.length > 0 ? { tokens: [...tokens] } : {}),
  };
  return JSON.stringify(payload);
}

/**
 * The elements in clipboard text, keeping only types the product registers (with their defaults
 * filled), or `null` when the text isn't elements copied from this product. Elements copied from
 * another product go through `foreign` (the product's `pasteForeign`) first; without it, or when
 * it takes none of them, it's `null` too.
 */
export function decodeClipboard(
  text: string,
  product: string,
  kinds: ElementKinds,
  foreign?: (el: CanvasElement, from: string) => CanvasElement | null,
): DecodedClipboard | null {
  if (!text.startsWith("{")) return null;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isPayload(data)) return null;
  const from = data.product;
  if (from !== product && !foreign) return null;
  const own =
    from === product
      ? data.elements
      : data.elements.flatMap((el) => (isElementLike(el) ? (foreign?.(el, from) ?? []) : []));
  const elements = own
    .filter((el) => kinds.isElement(el))
    .map((el) => kinds.kindOf(el).fillDefaults(el));
  if (elements.length === 0) return null;
  const ids = new Set(elements.map((el) => el.id));
  return {
    elements,
    selected: data.selected.filter((id) => ids.has(id)),
    assets: validAssets(data.assets),
    tokens: Array.isArray(data.tokens) ? data.tokens : [],
  };
}

/** Whether clipboard text is elements copied from any product (pasted as elements or not at all). */
export function isCanvasClipboard(text: string): boolean {
  if (!text.startsWith("{")) return false;
  try {
    return isPayload(JSON.parse(text));
  } catch {
    return false;
  }
}

function validAssets(assets: unknown): Record<string, string> {
  if (typeof assets !== "object" || assets === null) return {};
  return Object.fromEntries(
    Object.entries(assets).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function isPayload(data: unknown): data is ClipboardPayload {
  if (typeof data !== "object" || data === null) return false;
  const payload = data as Partial<ClipboardPayload>;
  return (
    payload.format === FORMAT &&
    payload.version === VERSION &&
    Array.isArray(payload.elements) &&
    Array.isArray(payload.selected)
  );
}

function isElementLike(el: unknown): el is CanvasElement {
  return typeof el === "object" && el !== null && typeof (el as CanvasElement).id === "string";
}
