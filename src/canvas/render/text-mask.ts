import { CanvasSource, CanvasTextGenerator, Texture, type Text } from "pixi.js";

/**
 * The text drawn on its own texture (its color as is, so draw it white), for masking with its
 * glyphs: the texture and how far its picture reaches past the text's corner (`padding`).
 */
export function textMaskTexture(text: Text): { texture: Texture; padding: number } {
  const resolution = text.resolution;
  const { canvasAndContext, frame } = CanvasTextGenerator.getCanvasAndContext({
    text: text.text,
    style: text.style,
    resolution,
  });
  // The generator's canvas goes back to its pool, so the picture is copied out of it.
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, frame.width);
  canvas.height = Math.max(1, frame.height);
  canvas
    .getContext("2d")!
    .drawImage(
      canvasAndContext.canvas as unknown as CanvasImageSource,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      0,
      0,
      frame.width,
      frame.height,
    );
  CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);
  const source = new CanvasSource({ resource: canvas, resolution });
  return { texture: new Texture({ source }), padding: text.style._getFinalPadding() };
}
