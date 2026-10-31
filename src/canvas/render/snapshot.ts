import { Container, Rectangle, type Renderer as PixiRenderer } from "pixi.js";

import type { CanvasElement, ElementKinds } from "../elements";
import type { CanvasTheme } from "./canvas-theme.types";
import type { ImageCache } from "./image-cache";
import { imageDemands } from "./image-demand";
import type { LayerPlacement } from "./layer-placement.types";
import { ElementLayer } from "./layers/element-layer";
import { LinkLayer } from "./layers/link-layer";
import type { SnapshotOptions, SnapshotTreeOptions } from "./snapshot.types";
import { maxTexturePixels } from "./texture-limits";
import type { ExportImages } from "./export-images";

/**
 * Draws elements off screen into a new canvas, with fresh views laid out like the live layers
 * (see `withSnapshotTree`). Nothing on screen changes.
 */
export function drawSnapshot(
  renderer: PixiRenderer,
  kinds: ElementKinds,
  images: ImageCache,
  theme: CanvasTheme,
  elements: readonly CanvasElement[],
  placement: LayerPlacement,
  { rect, scale, background, links }: SnapshotOptions,
): Promise<HTMLCanvasElement> {
  return withSnapshotTree(
    renderer,
    kinds,
    images,
    theme,
    elements,
    placement,
    { scale, links },
    (root) =>
      Promise.resolve(
        renderer.extract.canvas({
          target: root,
          frame: new Rectangle(rect.x, rect.y, rect.w, rect.h),
          resolution: scale,
          clearColor: background ?? [0, 0, 0, 0],
          antialias: true,
        }) as HTMLCanvasElement,
      ),
  );
}

/**
 * Builds the off-screen tree of `elements` (frames, links, the other elements, as the live layers
 * stack them), hands it to `draw` and destroys it after. Pictures aren't the canvas's textures: once
 * the views are built, each picture is decoded from its file at the size the tree draws it
 * (`ExportImages`), and the views showing one are drawn again with it.
 */
export async function withSnapshotTree<T>(
  renderer: PixiRenderer,
  kinds: ElementKinds,
  images: ImageCache,
  theme: CanvasTheme,
  elements: readonly CanvasElement[],
  placement: LayerPlacement,
  { scale, links }: SnapshotTreeOptions,
  draw: (root: Container, textures: ExportImages, assets: readonly string[]) => Promise<T>,
): Promise<T> {
  const assets = [...new Set(elements.flatMap((el) => kinds.kindOf(el).assets(el)))];
  // The canvas's copies give the sizes of pictures whose files' headers don't say.
  await Promise.all(assets.map((id) => images.load(id)));

  const textures = images.forExport(maxTexturePixels(renderer));
  const frames = new ElementLayer(kinds, textures, placement);
  const others = new ElementLayer(kinds, textures, placement);
  const lines = new LinkLayer(links);
  const root = new Container();
  root.addChild(frames, lines, others);
  try {
    frames.setTextZoom(scale);
    others.setTextZoom(scale);
    // The snapshot draws world units as CSS pixels, at `scale` pixels each.
    frames.setEffectScale(1);
    others.setEffectScale(1);
    lines.setTextZoom(scale);
    const frameElements = elements.filter((el) => kinds.kindOf(el).frame);
    const otherElements = elements.filter((el) => !kinds.kindOf(el).frame);
    frames.sync(frameElements);
    others.sync(otherElements);
    const uses = [...frames.imageUses(false), ...others.imageUses(false)];
    if (uses.length > 0) {
      await textures.prepare(imageDemands(uses, (id) => textures.naturalSize(id), scale));
      const showing = new Set(
        elements.filter((el) => kinds.kindOf(el).assets(el).length > 0).map((el) => el.id),
      );
      frames.sync(frameElements, [], showing);
      others.sync(otherElements, [], showing);
    }
    for (const link of links) link.update(elements);
    lines.draw({ zoom: 1, theme, highlighted: new Set() });
    return await draw(root, textures, assets);
  } finally {
    root.destroy({ children: true });
    textures.destroy();
  }
}
