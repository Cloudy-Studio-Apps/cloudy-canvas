import { createGeo, type GeoElement } from "../../modules";
import { INK_COLOR, TRANSPARENT } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { solidColor } from "./fig-paint-values";
import { BODY_PART, generatedPart, generatedText, TEXT_PART } from "./generated-parts";
import { nodeRect } from "./node-rect";

/** The board's geo variant for each FigJam shape; the others become rectangles. */
const GEO_KINDS: Record<string, string> = {
  SQUARE: "rectangle",
  ROUNDED_RECTANGLE: "rounded",
  ELLIPSE: "ellipse",
  DIAMOND: "diamond",
  TRIANGLE_UP: "triangle",
  TRIANGLE_DOWN: "triangle",
  PARALLELOGRAM_RIGHT: "parallelogram",
  PARALLELOGRAM_LEFT: "parallelogram",
  ENG_DATABASE: "cylinder",
  STAR: "star",
};

/** A shape with text: its outline, fill, stroke and centered text. */
export const convertShape: FigJamNodeConverter = (node, placement) => {
  const type = node.shapeWithTextType ?? "SQUARE";
  const body = generatedPart(node, BODY_PART);
  let kind = GEO_KINDS[type];
  if (!kind) {
    placement.ctx.warnings.add(
      `${type.toLowerCase().replaceAll("_", " ")} shapes became rectangles`,
    );
    kind = "rectangle";
  } else if (kind === "rectangle" && (body?.cornerRadius ?? 0) > 0) {
    kind = "rounded";
  }
  const fill = solidColor(body?.fillPaints) ?? TRANSPARENT;
  const stroke = solidColor(body?.strokePaints) ?? (fill === TRANSPARENT ? INK_COLOR : TRANSPARENT);
  const geo = createGeo(nodeRect(node, placement), kind, fill, stroke, "");
  const fontSize = generatedPart(node, TEXT_PART)?.fontSize ?? geo.fontSize;
  placement.ctx.place(node, geo.id);
  const el: GeoElement = { ...geo, text: generatedText(node), fontSize };
  placement.out.add(el);
};
