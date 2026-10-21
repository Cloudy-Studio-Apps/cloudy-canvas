import type { CanvasDocument, CanvasElement, ElementPatch } from "@canvas";
import {
  createId,
  fetchFirstImage,
  fetchLinkPreview,
  parseWebUrl,
  type HttpClient,
} from "@shared/core";

import { embedHeight, hasPreview } from "./embed.layout";
import type { EmbedElement } from "./embed.types";

/** The element as a card, or `null` when it's another type. */
export function embedOf(el: CanvasElement | undefined): EmbedElement | null {
  return el?.type === "embed" ? (el as EmbedElement) : null;
}

/** Cards whose preview hasn't been fetched yet. */
export function pendingEmbeds(elements: readonly CanvasElement[]): EmbedElement[] {
  return elements.flatMap((el) => {
    const embed = embedOf(el);
    return embed?.status === "loading" ? [embed] : [];
  });
}

/**
 * Fetches a card's title and picture and writes them to the document. It isn't an undo step:
 * pasting the link was, and the preview only fills it in. The card grows to fit a picture.
 */
export async function loadEmbedPreview(
  doc: CanvasDocument,
  el: EmbedElement,
  http: HttpClient,
): Promise<void> {
  const url = parseWebUrl(el.url);
  try {
    if (!url) throw new Error(`Not a web link: ${el.url}`);
    const preview = await fetchLinkPreview(http, url);
    const image = await fetchFirstImage(http, preview.imageUrls);
    const current = embedOf(doc.get(el.id));
    if (!current) return;
    const imageId = image ? createId() : null;
    if (image && imageId) doc.addAsset(imageId, image);
    const patch: ElementPatch<EmbedElement> = {
      title: preview.title,
      siteName: preview.siteName,
      imageId,
      status: "ready",
      h: embedHeight(current.w, hasPreview({ provider: current.provider, imageId })),
    };
    doc.updateUntracked(el.id, patch);
  } catch (error) {
    console.warn(`[embed] No preview for ${el.url}:`, error);
    const patch: ElementPatch<EmbedElement> = { status: "failed" };
    if (doc.get(el.id)) doc.updateUntracked(el.id, patch);
  }
}
