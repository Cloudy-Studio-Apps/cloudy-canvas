import type { GlyphOutliner } from "@shared/core";

import type { SvgText } from "../export/export.types";
import type { Rect } from "../geometry.types";
import type { CanvasLinks } from "../links";

/** What `Renderer.snapshot` draws, and how. */
export interface SnapshotOptions {
  /** The world rect to draw. */
  rect: Rect;
  /** Pixels per world unit. */
  scale: number;
  /** A 0xRRGGBB fill, or `null` for a transparent background. */
  background: number | null;
  /** Links resolved for the drawn elements only (fresh from the product's `createLinks`). */
  links: readonly CanvasLinks[];
}

/** What the off-screen tree of an export needs to be built (see `withSnapshotTree`). */
export type SnapshotTreeOptions = Pick<SnapshotOptions, "scale" | "links">;

/** What `Renderer.vectorSnapshot` writes, and how. */
export interface VectorSnapshotOptions {
  /** The world rect the document shows. */
  rect: Rect;
  /** A 0xRRGGBB fill, or `null` for a transparent background. */
  background: number | null;
  links: readonly CanvasLinks[];
  /** Text as glyph outlines or as live text. */
  text: SvgText;
  /** Shapes outlined text; without one, text stays live. */
  glyphs: GlyphOutliner | null;
}
