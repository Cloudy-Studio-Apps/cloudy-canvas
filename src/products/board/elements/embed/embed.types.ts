import type { CanvasElement, ElementDefaults, Rect } from "@canvas";

/** `youtube` plays in place; `link` opens in the browser. */
export type EmbedProvider = "youtube" | "link";

/** `loading` until the preview (title, picture) has been fetched; `failed` keeps the bare link. */
export type EmbedStatus = "loading" | "ready" | "failed";

/** A pasted link, shown as a card: a playable video or a web page. */
export interface EmbedElement extends CanvasElement {
  type: "embed";
  url: string;
  provider: EmbedProvider;
  title: string;
  /** e.g. "YouTube", or the page's host. */
  siteName: string;
  /** The document asset holding the card's picture (thumbnail, `og:image`), once fetched. */
  imageId: string | null;
  status: EmbedStatus;
}

export interface EmbedDefaults extends ElementDefaults {
  /** Card width when pasted. */
  width: number;
  minWidth: number;
  /** Space around the picture. */
  padding: number;
  /** Height of the strip with the title and site under the picture (the whole card without one). */
  footerHeight: number;
  /** Picture proportions (height / width). */
  previewRatio: number;
  radius: number;
  titleSize: number;
  siteSize: number;
  playRadius: number;
  buttonSize: number;
}

/** Where the parts of a card are, in the element's local coordinates. */
export interface EmbedLayout {
  /** The picture (and the player, when it plays), or `null` for a card without one. */
  preview: Rect | null;
  /** The play button's center, for videos. */
  play: { x: number; y: number } | null;
  footer: Rect;
  /** The "open in browser" button. */
  open: Rect;
}
