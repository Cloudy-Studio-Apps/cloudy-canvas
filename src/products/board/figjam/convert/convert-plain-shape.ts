import type { FigNode } from "@canvas/figma";

import { createGeo, createImage, type ImageElement } from "../../modules";
import { INK_COLOR, TRANSPARENT } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { imageHash, solidColor } from "./fig-paint-values";
import { nodeRect } from "./node-rect";

const WHITE = "#ffffff";

/**
 * A plain shape (a rectangle, an ellipse, a frame's background): its picture when it shows one,
 * otherwise a geo shape with its fill and stroke. One showing nothing is left out.
 */
export const convertPlainShape: FigJamNodeConverter = (node, placement) => {
  const { ctx, out } = placement;
  const rect = nodeRect(node, placement);
  const hash = imageHash(node.fillPaints);
  if (hash) {
    const assetId = ctx.imageAsset(hash);
    if (!assetId) return ctx.warnings.add("images missing from the file were left out");
    const image = framedImage(node, createImage(assetId, rect, ""));
    ctx.place(node, image.id);
    return out.add(image);
  }
  const fill = solidColor(node.fillPaints);
  const stroke = solidColor(node.strokePaints);
  if (!fill && !stroke) return;
  const kind =
    node.type === "ELLIPSE" ? "ellipse" : (node.cornerRadius ?? 0) > 0 ? "rounded" : "rectangle";
  const geo = createGeo(
    rect,
    kind,
    fill ?? TRANSPARENT,
    stroke ?? (fill ? TRANSPARENT : INK_COLOR),
    "",
  );
  ctx.place(node, geo.id);
  out.add(geo);
};

/**
 * FigJam frames pictures with a white border outside them: the board's image padding on a white
 * background, which grows the bounds around the picture as FigJam's border does.
 */
function framedImage(node: FigNode, image: ImageElement): ImageElement {
  const border = node.strokeWeight ?? 0;
  const white = solidColor(node.strokePaints) === WHITE;
  if (node.strokeAlign !== "OUTSIDE" || !white || border <= 0) return image;
  return {
    ...image,
    x: image.x - border,
    y: image.y - border,
    w: image.w + border * 2,
    h: image.h + border * 2,
    background: "white",
    padding: border,
  };
}
