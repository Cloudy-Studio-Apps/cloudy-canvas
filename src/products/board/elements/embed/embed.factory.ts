import { createElementBase, type Point, type Rect } from "@canvas";
import { displayHost, youtubeVideo } from "@shared/core";

import { EMBED_DEFAULTS } from "./embed.defaults";
import { embedHeight } from "./embed.layout";
import type { EmbedElement } from "./embed.types";

/** A card for `url`, still loading its preview; it's as tall as its width needs. */
export function createEmbed(
  url: URL,
  at: Point,
  index: string,
  w: number = EMBED_DEFAULTS.width,
): EmbedElement {
  const provider = youtubeVideo(url) ? "youtube" : "link";
  const width = Math.max(EMBED_DEFAULTS.minWidth, w);
  const rect: Rect = { x: at.x, y: at.y, w: width, h: embedHeight(width, provider === "youtube") };
  return {
    ...createElementBase("embed", rect, index),
    url: url.href,
    provider,
    title: displayHost(url),
    siteName: provider === "youtube" ? "YouTube" : displayHost(url),
    imageId: null,
    status: "loading",
  };
}
