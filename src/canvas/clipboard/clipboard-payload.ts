import type { CanvasElement, ElementKinds } from "../elements";
import type { ClipboardPayload, DecodedClipboard } from "./clipboard-payload.types";

const FORMAT = "cloudy-canvas";
const VERSION = 1;

export function encodeClipboard(
  product: string,
  elements: readonly CanvasElement[],
  selected: Iterable<string>,
  assets: Record<string, string>,
): string {
  const payload: ClipboardPayload = {
    format: FORMAT,
    version: VERSION,
    product,
    elements: [...elements],
    selected: [...selected],
    assets,
  };
  return JSON.stringify(payload);
}

/**
 * The elements in clipboard text, keeping only types the product registers (with their defaults
 * filled), or `null` when the text isn't elements copied from this product.
 */
export function decodeClipboard(
  text: string,
  product: string,
  kinds: ElementKinds,
): DecodedClipboard | null {
  if (!text.startsWith("{")) return null;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isPayload(data) || data.product !== product) return null;
  const elements = data.elements
    .filter((el) => kinds.isElement(el))
    .map((el) => kinds.kindOf(el).fillDefaults(el));
  if (elements.length === 0) return null;
  const ids = new Set(elements.map((el) => el.id));
  return {
    elements,
    selected: data.selected.filter((id) => ids.has(id)),
    assets: validAssets(data.assets),
  };
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
