import { fontMetrics } from "./font-metrics";
import { measureSpan } from "./measure-span";
import type {
  RichFragment,
  RichLine,
  RichSpan,
  RichTextFrame,
  RichTextLayout,
} from "./rich-text.types";

/** A word or a run of spaces, split where spans change, measured. */
interface Piece {
  start: number;
  end: number;
  span: number;
  w: number;
  space: boolean;
}

/**
 * Lays `text` out in `frame`, styled by `spans` (in order, covering it): paragraphs split at line
 * breaks and wrap greedily between words at `frame.wrap` (a word wider than that stays whole);
 * spaces at a line's end hang past it. A line is as tall as its tallest span and every span sits
 * on its baseline, each centered in its own line height as in CSS and Figma. Lines align in the
 * frame's width (justified ones but a paragraph's last spread their spaces), and the block in
 * its height.
 */
export function layoutRichText(
  text: string,
  spans: readonly RichSpan[],
  frame: RichTextFrame,
): RichTextLayout {
  const lines: RichLine[] = [];
  let paragraphStart = 0;
  for (const paragraph of text.split("\n")) {
    const end = paragraphStart + paragraph.length;
    const pieces = piecesOf(text, paragraphStart, end, spans);
    const paragraphLines = wrap(pieces, frame.wrap);
    paragraphLines.forEach((linePieces, i) => {
      const last = i === paragraphLines.length - 1;
      lines.push(buildLine(linePieces, paragraphStart, end, spans, frame, last));
    });
    paragraphStart = end + 1;
  }

  let top = 0;
  for (const line of lines) {
    line.baseline += top;
    line.top = top;
    top += line.height;
  }
  const h = top;
  const shift =
    frame.vAlign === "middle" ? (frame.h - h) / 2 : frame.vAlign === "bottom" ? frame.h - h : 0;
  if (shift !== 0) {
    for (const line of lines) {
      line.top += shift;
      line.baseline += shift;
    }
  }
  return { text, spans, frame, lines, w: Math.max(0, ...lines.map((line) => line.w)), h };
}

/** The words and space runs of characters `start` to `end`, cut where spans change. */
function piecesOf(text: string, start: number, end: number, spans: readonly RichSpan[]): Piece[] {
  const pieces: Piece[] = [];
  const pattern = /\s+|\S+/g;
  const paragraph = text.slice(start, end);
  for (let match = pattern.exec(paragraph); match; match = pattern.exec(paragraph)) {
    const a = start + match.index;
    const b = a + match[0].length;
    const space = /^\s/.test(match[0]);
    spans.forEach((span, index) => {
      const from = Math.max(a, span.start);
      const to = Math.min(b, span.end);
      if (to <= from) return;
      pieces.push({
        start: from,
        end: to,
        span: index,
        w: measureSpan(text.slice(from, to), span.font),
        space,
      });
    });
  }
  return pieces;
}

/** The pieces of a paragraph in lines: a word that would pass `width` starts a new line. */
function wrap(pieces: readonly Piece[], width: number | null): Piece[][] {
  const lines: Piece[][] = [[]];
  let lineW = 0;
  let word: Piece[] = [];
  let wordW = 0;
  const flushWord = () => {
    const line = lines[lines.length - 1]!;
    const hasContent = line.some((piece) => !piece.space);
    if (width !== null && hasContent && lineW + wordW > width + 0.01) {
      lines.push([...word]);
      lineW = wordW;
    } else {
      line.push(...word);
      lineW += wordW;
    }
    word = [];
    wordW = 0;
  };
  for (const piece of pieces) {
    if (piece.space) {
      flushWord();
      // Spaces stay on the line they end, hanging past its edge.
      lines[lines.length - 1]!.push(piece);
      lineW += piece.w;
      continue;
    }
    // Pieces of one word (in different spans) wrap together.
    const previous = word[word.length - 1];
    if (previous && previous.end !== piece.start) flushWord();
    word.push(piece);
    wordW += piece.w;
  }
  flushWord();
  return lines;
}

function buildLine(
  pieces: readonly Piece[],
  paragraphStart: number,
  paragraphEnd: number,
  spans: readonly RichSpan[],
  frame: RichTextFrame,
  lastOfParagraph: boolean,
): RichLine {
  const start = pieces[0]?.start ?? paragraphStart;
  const end = pieces[pieces.length - 1]?.end ?? (lastOfParagraph ? paragraphEnd : start);
  // Trailing spaces don't count for alignment.
  let contentEnd = pieces.length;
  while (contentEnd > 0 && pieces[contentEnd - 1]!.space) contentEnd--;
  const contentW = pieces.slice(0, contentEnd).reduce((w, piece) => w + piece.w, 0);

  const justify = frame.align === "justify" && !lastOfParagraph && frame.wrap !== null;
  const inner = pieces.slice(0, contentEnd).filter((piece) => piece.space);
  const innerW = inner.reduce((w, piece) => w + piece.w, 0);
  const extra = justify && innerW > 0 ? Math.max(0, frame.w - contentW) : 0;

  const x =
    frame.align === "center"
      ? (frame.w - contentW) / 2
      : frame.align === "right"
        ? frame.w - contentW
        : 0;
  const fragments: RichFragment[] = [];
  let pen = x;
  pieces.forEach((piece, i) => {
    const stretched = extra > 0 && piece.space && i < contentEnd ? (piece.w / innerW) * extra : 0;
    const w = piece.w + stretched;
    fragments.push({
      start: piece.start,
      end: piece.end,
      span: piece.span,
      x: pen,
      w,
      space: piece.space,
    });
    pen += w;
  });

  // Vertical metrics: each span centered in its own line height, all on one baseline.
  const used = new Set(pieces.map((piece) => piece.span));
  if (used.size === 0) used.add(spanIndexAt(spans, start));
  let above = 0;
  let below = 0;
  for (const index of used) {
    const span = spans[index];
    if (!span) continue;
    const lineHeight = span.font.size * span.font.lineHeight;
    const { ascent, descent } = fontMetrics(span.font);
    const top = (lineHeight - (ascent + descent)) / 2 + ascent;
    above = Math.max(above, top);
    below = Math.max(below, lineHeight - top);
  }
  return {
    start,
    end,
    top: 0,
    height: above + below,
    baseline: above,
    x,
    w: contentW + extra,
    fragments,
  };
}

/** The span holding character `index`, or the last one before it (an empty line's style). */
export function spanIndexAt(spans: readonly RichSpan[], index: number): number {
  let found = 0;
  spans.forEach((span, i) => {
    if (span.start <= index) found = i;
  });
  return found;
}
