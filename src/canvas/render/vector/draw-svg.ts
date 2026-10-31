import type { Container, Renderer as PixiRenderer, TextureSource } from "pixi.js";

import type { ExportImages } from "../export-images";
import type { VectorSnapshotOptions } from "../snapshot.types";
import type { SvgContext } from "./svg-context.types";
import { SvgDefs } from "./svg-defs";
import { svgDocument } from "./svg-document";
import { resolveFaces } from "./svg-faces";
import { writeChildren } from "./walk-display";

/**
 * Writes the off-screen tree of an export (`withSnapshotTree`) as an SVG document: it reads what
 * the kinds drew, so every element type comes out as it looks with no code of its own.
 */
export async function drawSvg(
  renderer: PixiRenderer,
  root: Container,
  textures: ExportImages,
  assetIds: readonly string[],
  { rect, background, text, glyphs }: VectorSnapshotOptions,
): Promise<string> {
  const assets = new Map<TextureSource, string>();
  for (const id of assetIds) {
    const source = textures.get(id)?.source;
    if (source) assets.set(source, id);
  }
  const outlined = text === "outlines" ? glyphs : null;
  const context: SvgContext = {
    renderer,
    rect,
    defs: new SvgDefs(),
    textures,
    assets,
    glyphs: outlined,
    faces: outlined ? await resolveFaces(root, outlined) : new Map(),
    writeChildren: (node) => writeChildren(node, context),
  };
  const body = writeChildren(root, context);
  return svgDocument(rect, background, context.defs, body);
}
