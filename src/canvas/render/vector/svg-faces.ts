import { Text, type Container } from "pixi.js";

import type { FontRequest, GlyphOutliner } from "@shared/core";

import type { FontStyle, FontWeight } from "../../text/text-font.types";
import { RichTextSprite } from "../rich-text-sprite";
import type { SvgFaces } from "./svg-context.types";
import { faceKey, familyOf, weightOf } from "./text-face";

/** How long a face may take to be read before its text stays live. */
const FACE_TIMEOUT_MS = 8000;
/** CSS names of no font in particular: nothing to read a file of. */
const GENERIC_FAMILIES: ReadonlySet<string> = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
]);

/**
 * Finds the face of every text under `root`: the first family of its list whose file can be read,
 * as the canvas falls back along it. A text with none stays live.
 */
export async function resolveFaces(root: Container, glyphs: GlyphOutliner): Promise<SvgFaces> {
  const wanted = new Map<string, { family: string; weight: FontWeight; style: FontStyle }>();
  const want = (family: string, weight: FontWeight, style: FontStyle) =>
    wanted.set(faceKey(family, weight, style), { family, weight, style });
  visitTexts(root, (node) => {
    if (node instanceof RichTextSprite) {
      for (const { font } of node.layout?.spans ?? []) want(font.family, font.weight, font.style);
    } else {
      const fontStyle = node.style.fontStyle === "italic" ? "italic" : "normal";
      want(familyOf(node.style), weightOf(node.style), fontStyle);
    }
  });
  const found = await Promise.all(
    [...wanted].map(
      async ([key, { family, weight, style }]) =>
        [key, await firstReadable(family, weight, style, glyphs)] as const,
    ),
  );
  return new Map(found);
}

function visitTexts(node: Container, visit: (text: Text | RichTextSprite) => void): void {
  if (node instanceof Text || node instanceof RichTextSprite) visit(node);
  for (const child of node.children) visitTexts(child, visit);
}

async function firstReadable(
  families: string,
  weight: FontWeight,
  style: FontStyle,
  glyphs: GlyphOutliner,
): Promise<FontRequest | null> {
  for (const family of familyNames(families)) {
    const request = { family, weight, style };
    if (await withinTimeout(glyphs.prepare(request))) return request;
  }
  return null;
}

/** The names in a CSS family list that can have a file. */
function familyNames(list: string): string[] {
  const names = list.match(/"[^"]*"|'[^']*'|[^,]+/g) ?? [];
  return names
    .map((name) => name.trim().replace(/^["']|["']$/g, ""))
    .filter((name) => name && !GENERIC_FAMILIES.has(name.toLowerCase()));
}

function withinTimeout(ready: Promise<boolean>): Promise<boolean> {
  return Promise.race([
    ready,
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), FACE_TIMEOUT_MS)),
  ]);
}
