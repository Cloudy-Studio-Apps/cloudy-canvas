import type { Container, Renderer as PixiRenderer, TextureSource } from "pixi.js";

import type { FontRequest, GlyphOutliner } from "@shared/core";

import type { Rect } from "../../geometry.types";
import type { ExportImages } from "../export-images";
import type { VectorTarget } from "../snapshot.types";
import type { SvgDefs } from "./svg-defs";

/** The faces outlined text uses, by `faceKey`; `null`: none could be read, so it stays live. */
export type SvgFaces = ReadonlyMap<string, FontRequest | null>;

/** What the writers of one SVG document share. */
export interface SvgContext {
  renderer: PixiRenderer;
  /** The world rect the document shows. */
  rect: Rect;
  defs: SvgDefs;
  textures: ExportImages;
  /** Texture sources → the assets they show, so pictures embed their files. */
  assets: ReadonlyMap<TextureSource, string>;
  /** Who reads the document: `pdf` has writers flatten what a PDF can't hold. */
  target: VectorTarget;
  /** Pixels per world unit of what's flattened. */
  flattenScale: number;
  /** Shapes outlined text; `null` keeps every text live. */
  glyphs: GlyphOutliner | null;
  faces: SvgFaces;
  /** What a container's children draw, as markup (the walker, handed to the writers). */
  writeChildren(node: Container): string;
}

/** One filled outline of a `Graphics`: its path data, and whether it has holes to keep open. */
export interface SvgOutline {
  d: string;
  evenOdd: boolean;
}

/** How `flatten` frames what it draws. */
export interface FlattenOptions {
  /** World units past the bounds to take in (what effects draw). */
  reach?: number;
  /** Whether the node is in world coordinates, so it can be cut to the exported rect. */
  world?: boolean;
}
