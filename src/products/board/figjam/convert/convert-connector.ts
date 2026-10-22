import type { CanvasElement, ElementSide } from "@canvas";
import { applyMatrix, type FigConnectorEnd, type FigMatrix } from "@canvas/figma";

import {
  CONNECTOR_DEFAULTS,
  createConnector,
  createTextDraft,
  type ArrowHead,
  type ConnectorElement,
  type ConnectorEnd,
  type ConnectorStyle,
  type TextElement,
} from "../../modules";
import { LINE_COLORS } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import type { FigJamContext } from "./figjam-context";
import { solidColor } from "./fig-paint-values";
import { BODY_PART, generatedPart, generatedText, TEXT_PART } from "./generated-parts";

const SIDES: Record<string, ElementSide> = {
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom",
  LEFT: "left",
};
/** Line ends drawn as arrows; the others (round, none, …) are plain. */
const ARROW_CAPS = new Set(["ARROW_LINES", "ARROW_EQUILATERAL", "TRIANGLE_FILLED"]);
/** A label's font size when the file doesn't say. */
const LABEL_FONT_SIZE = 16;
/** A character's rough width over the font size, to center a label before it's measured. */
const CHARACTER_WIDTH = 0.55;

/**
 * A connector between the elements its ends are on (or free ends), once every node is converted.
 * Curved lines become straight ones; a label becomes a text at the middle of the line.
 */
export const convertConnector: FigJamNodeConverter = (node, { parentWorld, out, ctx }) => {
  out.defer(() => {
    const start = connectorEnd(node.connectorStart, parentWorld, ctx);
    const end = connectorEnd(node.connectorEnd, parentWorld, ctx);
    const body = generatedPart(node, BODY_PART);
    const connector = createConnector(
      start,
      end,
      {
        style: lineStyle(node.connectorLineStyle, ctx),
        color: solidColor(body?.strokePaints) ?? LINE_COLORS[0].value,
        startHead: arrowHead(node.connectorStartCap),
        endHead: arrowHead(node.connectorEndCap),
      },
      "",
    );
    const line: ConnectorElement = {
      ...connector,
      size: body?.strokeWeight ?? CONNECTOR_DEFAULTS.lineWidth,
    };
    const elements: CanvasElement[] = [line];
    const label = generatedText(node).trim();
    if (label) {
      ctx.warnings.add("connector labels became texts beside their line");
      const fontSize = generatedPart(node, TEXT_PART)?.fontSize ?? LABEL_FONT_SIZE;
      const w = Math.round(label.length * fontSize * CHARACTER_WIDTH);
      const at = { x: (start.x + end.x) / 2 - w / 2, y: (start.y + end.y) / 2 };
      const text: TextElement = {
        ...createTextDraft(at, LINE_COLORS[0].value, fontSize),
        text: label,
        w,
      };
      elements.push(text);
    }
    return elements;
  });
};

/**
 * An end on the element its node became, or free where FigJam put it (a free end is on the page,
 * in its coordinates).
 */
function connectorEnd(
  end: FigConnectorEnd | undefined,
  parentWorld: FigMatrix,
  ctx: FigJamContext,
): ConnectorEnd {
  const position = end?.position ?? { x: 0, y: 0 };
  const shapeId = ctx.elementOf(end?.endpointNodeID);
  const point = applyMatrix(ctx.worldOf(end?.endpointNodeID) ?? parentWorld, position);
  return {
    shapeId,
    side: shapeId ? (SIDES[end?.magnet ?? ""] ?? null) : null,
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

function lineStyle(style: string | undefined, ctx: FigJamContext): ConnectorStyle {
  if (style === "ELBOWED") return "elbow";
  if (style === "CURVED") ctx.warnings.add("curved connectors became straight");
  return "straight";
}

function arrowHead(cap: string | undefined): ArrowHead {
  return cap && ARROW_CAPS.has(cap) ? "arrow" : "none";
}
