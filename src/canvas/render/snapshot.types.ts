import type { GlyphOutliner } from "@shared/core";

import type { ElementClip, ScenePlacement } from "./layer-placement.types";
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
  /** What clips each element, when they're drawn changed from the canvas (see `ExportHost.clipsOf`). */
  clips?: ReadonlyMap<string, ElementClip>;
  /** Where the elements are drawn, when they come from another scene than the canvas's. */
  placement?: ScenePlacement;
  /**
   * Where pictures' files are read, when the elements come from another document than the
   * canvas's (a fork): the canvas's image cache is borrowed only for what it holds already.
   */
  readAsset?: AssetReader;
}

/** Reads a picture's file by asset id. */
export type AssetReader = (assetId: string) => Uint8Array | undefined;

/** What an export says about where its elements are drawn (see `Renderer.snapshot`). */
export type PlacementOptions = Pick<SnapshotOptions, "clips" | "placement">;

/** What the off-screen tree of an export needs to be built (see `withSnapshotTree`). */
export type SnapshotTreeOptions = Pick<SnapshotOptions, "scale" | "links" | "readAsset">;

/** Who reads a vector document: SVG viewers, or `svgToPdf`. */
export type VectorTarget = "svg" | "pdf";

/** What `Renderer.vectorSnapshot` writes, and how. */
export interface VectorSnapshotOptions {
  /** The world rect the document shows. */
  rect: Rect;
  /** A 0xRRGGBB fill, or `null` for a transparent background. */
  background: number | null;
  links: readonly CanvasLinks[];
  /** What clips each element, as `SnapshotOptions.clips`. */
  clips?: ReadonlyMap<string, ElementClip>;
  /** Where the elements are drawn, as `SnapshotOptions.placement`. */
  placement?: ScenePlacement;
  /** Where pictures' files are read, as `SnapshotOptions.readAsset`. */
  readAsset?: AssetReader;
  /** Text as glyph outlines or as live text. */
  text: SvgText;
  /** `pdf` flattens what a PDF can't hold, for `svgToPdf`. */
  target?: VectorTarget;
  /** Pixels per world unit of what's flattened (2 by default). */
  imageScale?: number;
  /** Shapes outlined text; without one, text stays live. */
  glyphs: GlyphOutliner | null;
}
