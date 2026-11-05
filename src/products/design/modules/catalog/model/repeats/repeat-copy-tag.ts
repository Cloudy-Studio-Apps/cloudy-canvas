import type { CanvasElement } from "@canvas";

import type { RepeatCopyTag } from "./repeat-copy-tag.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The `repeatCopy` tag of a layer a brochure's repeat made, read defensively; `null` for others. */
export function repeatCopyTag(el: CanvasElement | undefined): RepeatCopyTag | null {
  const tag = (el as { repeatCopy?: unknown } | undefined)?.repeatCopy;
  if (!isRecord(tag)) return null;
  const { brochure, iterator, key, source } = tag;
  if (
    typeof brochure !== "string" ||
    typeof iterator !== "string" ||
    typeof key !== "string" ||
    typeof source !== "string"
  ) {
    return null;
  }
  return { brochure, iterator, key, source };
}
