import { CanvasTextMetrics, type ColorSource, type Text } from "pixi.js";

import { decorationRect } from "../../text/rich/draw-rich-text";
import type { RichTextLayout } from "../../text/rich/rich-text.types";
import { outlineRun } from "../../text/outline-run";
import { RichTextSprite } from "../rich-text-sprite";
import { contoursData } from "./path-data";
import { escapeXml, colorOf, matrixValue, num } from "./svg-format";
import { faceKey, familyOf, weightOf } from "./text-face";
import type { SvgContext } from "./svg-context.types";
import type { TextRun } from "./write-text.types";

const WHITE = "#ffffff";

/**
 * A view's text as markup in its parent's coordinates: glyph outlines when its face can be read
 * and outlines were asked for, else live `<text>`. `white` paints it all opaque white (a mask).
 */
export function writeText(node: Text | RichTextSprite, w: SvgContext, white = false): string {
  if (node instanceof RichTextSprite) {
    return node.layout ? writeLayout(node.layout, w, white) : "";
  }
  node.updateLocalTransform();
  const transform = matrixValue(node.localTransform);
  const runs = pixiTextRuns(node, white);
  const body = runs.map((run) => writeRun(run, w)).join("");
  return transform && body ? `<g transform="${transform}">${body}</g>` : body;
}

/** The lines of a Pixi text where its canvas text draws them. */
function pixiTextRuns(node: Text, white: boolean): TextRun[] {
  const { style } = node;
  const metrics = CanvasTextMetrics.measureText(node.text, style);
  const { lines, lineWidths, lineHeight, maxLineWidth, fontProperties } = metrics;
  const shift = Math.max(0, (lineHeight - fontProperties.fontSize) / 2);
  const { hex, alpha } = white
    ? { hex: WHITE, alpha: 1 }
    : colorOf(style.fill as unknown as ColorSource);
  return lines.flatMap((line, i) => {
    if (!line) return [];
    const width = lineWidths[i] ?? 0;
    const free = maxLineWidth - width;
    const spaces = line.split(" ").length - 1;
    const justified = style.align === "justify" && i < lines.length - 1 && spaces > 0;
    return [
      {
        text: line,
        x: style.align === "right" ? free : style.align === "center" ? free / 2 : 0,
        baseline: i * lineHeight + fontProperties.ascent + shift,
        family: familyOf(style),
        size: style.fontSize,
        weight: weightOf(style),
        style: style.fontStyle === "italic" ? "italic" : "normal",
        letterSpacing: style.letterSpacing,
        wordSpacing: justified ? free / spaces : 0,
        hex,
        alpha,
      },
    ];
  });
}

/** A laid-out text's fragments, on their baselines, with their underlines. */
function writeLayout(layout: RichTextLayout, w: SvgContext, white: boolean): string {
  const parts: string[] = [];
  for (const line of layout.lines) {
    for (const fragment of line.fragments) {
      const span = layout.spans[fragment.span];
      if (!span || (!white && span.color === null)) continue;
      const hex = white ? WHITE : (span.color ?? WHITE);
      const painted = colorOf(hex);
      const alpha = white ? 1 : span.alpha * painted.alpha;
      if (!fragment.space) {
        parts.push(
          writeRun(
            {
              text: layout.text.slice(fragment.start, fragment.end),
              x: fragment.x,
              baseline: line.baseline,
              family: span.font.family,
              size: span.font.size,
              weight: span.font.weight,
              style: span.font.style,
              letterSpacing: span.font.letterSpacing,
              wordSpacing: 0,
              hex: painted.hex,
              alpha,
            },
            w,
          ),
        );
      }
      const rule = decorationRect(layout, line, fragment);
      if (rule) {
        parts.push(
          `<rect x="${num(rule.x)}" y="${num(rule.y)}" width="${num(rule.w)}"` +
            ` height="${num(rule.h)}" ${fillAttrs(painted.hex, alpha)}/>`,
        );
      }
    }
  }
  return parts.join("");
}

function writeRun(run: TextRun, w: SvgContext): string {
  return outlinedRun(run, w) ?? liveRun(run);
}

/** The run's glyphs, word by word when its spaces are wider; `null` keeps it live. */
function outlinedRun(run: TextRun, w: SvgContext): string | null {
  const key = faceKey(run.family, run.weight, run.style);
  const face = w.faces.get(key);
  if (!face || !w.glyphs) return null;
  const pieces = run.wordSpacing > 0 ? run.text.split(" ") : [run.text];
  const space = run.wordSpacing > 0 ? w.glyphs.shape(face, " ", run.size) : null;
  const gap = (space?.glyphs[0]?.advance ?? 0) + run.letterSpacing + run.wordSpacing;
  let pen = run.x;
  const data: string[] = [];
  for (const piece of pieces) {
    const shaped = outlineRun(w.glyphs, face, piece, run.size, {
      letterSpacing: run.letterSpacing,
      x: pen,
      baseline: run.baseline,
    });
    if (!shaped) return null;
    data.push(contoursData(shaped.contours));
    pen += shaped.advance + gap;
  }
  return `<path d="${data.join("")}" ${fillAttrs(run.hex, run.alpha)}/>`;
}

function liveRun(run: TextRun): string {
  const attrs = [
    `x="${num(run.x)}"`,
    `y="${num(run.baseline)}"`,
    `font-family="${escapeXml(run.family)}"`,
    `font-size="${num(run.size)}"`,
    `font-weight="${run.weight}"`,
    ...(run.style === "italic" ? ['font-style="italic"'] : []),
    ...(run.letterSpacing ? [`letter-spacing="${num(run.letterSpacing)}"`] : []),
    ...(run.wordSpacing ? [`word-spacing="${num(run.wordSpacing)}"`] : []),
    fillAttrs(run.hex, run.alpha),
  ];
  return `<text ${attrs.join(" ")} xml:space="preserve">${escapeXml(run.text)}</text>`;
}

function fillAttrs(hex: string, alpha: number): string {
  return alpha < 1 ? `fill="${hex}" fill-opacity="${num(alpha)}"` : `fill="${hex}"`;
}
