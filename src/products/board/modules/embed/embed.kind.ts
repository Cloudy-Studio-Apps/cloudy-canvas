import {
  BoxKind,
  type ElementDescription,
  type ElementInteraction,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type InteractionQuery,
  type Point,
  type Rect,
} from "@canvas";
import { parseWebUrl } from "@shared/core";

import type { BoardToolOptions } from "../../board-options.types";
import { drawEmbed } from "./embed.draw";
import { EMBED_DEFAULTS } from "./embed.defaults";
import { createEmbed } from "./embed.factory";
import { embedInteractionAt } from "./embed.interactions";
import { embedHeight, hasPreview } from "./embed.layout";
import type { EmbedDefaults, EmbedElement } from "./embed.types";

/**
 * A pasted link as a card: YouTube videos play in place, other pages open in the browser. Its
 * height follows its width, so resizing keeps the card's layout.
 */
export class EmbedKind extends BoxKind<EmbedElement, BoardToolOptions> {
  readonly type = "embed";
  readonly label = "Link";
  readonly description = "A pasted link: videos play on the board, pages open in the browser.";
  override readonly defaults: EmbedDefaults = EMBED_DEFAULTS;
  override readonly keepsRatio = true;
  override readonly specProperties = {
    url: { type: "string", description: "embed: the http(s) link to show as a card." },
  };
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y", "w", "url"]);

  draw(view: ElementView, el: EmbedElement): void {
    drawEmbed(view, el);
  }

  override build(spec: ElementSpec, index: string): EmbedElement {
    const { url } = spec.args;
    return createEmbed(requireWebUrl(url), { x: spec.x, y: spec.y }, index, spec.w);
  }

  override interactionAt(
    el: EmbedElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    return embedInteractionAt(el, p, query);
  }

  override resize(el: EmbedElement, rect: Rect): ElementPatch<EmbedElement> {
    const w = Math.max(EMBED_DEFAULTS.minWidth, Math.round(rect.w));
    return { x: rect.x, y: rect.y, w, h: embedHeight(w, hasPreview(el)) };
  }

  /** A new `url` starts the card over: it loads the new link's preview. */
  override completePatch(
    el: EmbedElement,
    patch: ElementPatch<EmbedElement>,
  ): ElementPatch<EmbedElement> {
    if (patch.url !== undefined) {
      const fresh = createEmbed(
        requireWebUrl(patch.url),
        { x: patch.x ?? el.x, y: patch.y ?? el.y },
        el.index,
        patch.w ?? el.w,
      );
      const { url, provider, title, siteName, imageId, status, w, h } = fresh;
      return { ...patch, url, provider, title, siteName, imageId, status, w, h };
    }
    if (patch.w === undefined) return patch;
    const w = Math.max(EMBED_DEFAULTS.minWidth, patch.w);
    return { ...patch, w, h: embedHeight(w, hasPreview(el)) };
  }

  override assets(el: EmbedElement): string[] {
    return el.imageId ? [el.imageId] : [];
  }

  override fillDefaults(el: EmbedElement): EmbedElement {
    return {
      ...el,
      provider: el.provider ?? "link",
      title: el.title ?? el.url,
      siteName: el.siteName ?? "",
      imageId: el.imageId ?? null,
      status: el.status ?? "ready",
    };
  }

  override describe(el: EmbedElement): ElementDescription {
    return { label: `${el.title} (${el.url})`, kind: el.provider };
  }
}

function requireWebUrl(value: unknown): URL {
  const parsed = typeof value === "string" ? parseWebUrl(value) : null;
  if (!parsed) throw new Error('"url" must be an http(s) link.');
  return parsed;
}
