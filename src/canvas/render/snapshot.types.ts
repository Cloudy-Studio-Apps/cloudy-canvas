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
