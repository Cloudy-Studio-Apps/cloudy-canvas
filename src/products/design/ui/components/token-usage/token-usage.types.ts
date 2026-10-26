import type { TokenUsage } from "@canvas";

/** A page's layers using a token. */
export interface UsagePage {
  pageId: string;
  name: string;
  ids: string[];
}

/** A token's usage, with its layers grouped by page (the page on screen first). */
export interface TokenUsageView extends TokenUsage {
  byPage: UsagePage[];
  /** Layers using it, directly or through styles. */
  layerCount: number;
}

export interface TokenUsageProps {
  /** A variable's or a style's id. */
  id: string;
}
