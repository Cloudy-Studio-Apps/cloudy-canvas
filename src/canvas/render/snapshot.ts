import { Container, Rectangle, type Renderer as PixiRenderer } from "pixi.js";

import type { CanvasElement, ElementKinds } from "../elements";
import type { CanvasTheme } from "./canvas-theme.types";
import type { ImageCache } from "./image-cache";
import type { LayerPlacement } from "./layer-placement.types";
import { ElementLayer } from "./layers/element-layer";
import { LinkLayer } from "./layers/link-layer";
import type { SnapshotOptions } from "./snapshot.types";

/**
 * Draws elements off screen into a new canvas, with fresh views laid out like the live layers
 * (frames, links, the other elements) and the images they show loaded first. Nothing on screen
 * changes.
 */
export async function drawSnapshot(
  renderer: PixiRenderer,
  kinds: ElementKinds,
  images: ImageCache,
  theme: CanvasTheme,
  elements: readonly CanvasElement[],
  placement: LayerPlacement,
  { rect, scale, background, links }: SnapshotOptions,
): Promise<HTMLCanvasElement> {
  const assets = elements.flatMap((el) => kinds.kindOf(el).assets(el));
  await Promise.all(assets.map((id) => images.load(id)));

  const frames = new ElementLayer(kinds, images, placement);
  const others = new ElementLayer(kinds, images, placement);
  const lines = new LinkLayer(links);
  const root = new Container();
  root.addChild(frames, lines, others);
  try {
    frames.setTextZoom(scale);
    others.setTextZoom(scale);
    lines.setTextZoom(scale);
    frames.sync(elements.filter((el) => kinds.kindOf(el).frame));
    others.sync(elements.filter((el) => !kinds.kindOf(el).frame));
    for (const link of links) link.update(elements);
    lines.draw({ zoom: 1, theme, highlighted: new Set() });
    const canvas = renderer.extract.canvas({
      target: root,
      frame: new Rectangle(rect.x, rect.y, rect.w, rect.h),
      resolution: scale,
      clearColor: background ?? [0, 0, 0, 0],
      antialias: true,
    });
    return canvas as HTMLCanvasElement;
  } finally {
    root.destroy({ children: true });
  }
}
