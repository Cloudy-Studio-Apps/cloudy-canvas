import type { CanvasElement } from "@canvas";

import type { PageItemTag } from "./page-item.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** What marks a layer as a master layer's copy on a page (`catalogCopy`), `null` for others. */
export function pageItemTag(el: CanvasElement | undefined): PageItemTag | null {
  const tag = (el as { catalogCopy?: unknown } | undefined)?.catalogCopy;
  if (!isRecord(tag)) return null;
  const { brochure, master, source, half } = tag;
  if (typeof brochure !== "string" || typeof master !== "string" || typeof source !== "string") {
    return null;
  }
  return half === "left" || half === "right"
    ? { brochure, master, source, half }
    : { brochure, master, source };
}

/** A page item's template (`catalogText`, e.g. "Page {page} of {pages}"), `null` for others. */
export function pageItemTemplate(el: CanvasElement | undefined): string | null {
  const template = (el as { catalogText?: unknown } | undefined)?.catalogText;
  return typeof template === "string" ? template : null;
}
