import type { Point } from "@canvas";
import { parseWebUrl } from "@shared/core";

import { createEmbed } from "./embed.factory";
import type { EmbedElement } from "./embed.types";

/** A card for pasted text that's a single link, centered on `at`; `null` for any other text. */
export function createPastedEmbed(text: string, at: Point, index: string): EmbedElement | null {
  const url = parseWebUrl(text);
  if (!url) return null;
  const el = createEmbed(url, at, index);
  return { ...el, x: Math.round(at.x - el.w / 2), y: Math.round(at.y - el.h / 2) };
}
