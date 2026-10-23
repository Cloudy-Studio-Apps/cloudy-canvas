import type { Point, Rect } from "../../geometry.types";
import { measureSpan, spanOffsets } from "./measure-span";
import type { RichFragment, RichLine, RichTextLayout } from "./rich-text.types";

const offsetsCache = new WeakMap<RichFragment, number[]>();

/** Where each character boundary of a fragment falls, from the text box's left. */
export function fragmentOffsets(layout: RichTextLayout, fragment: RichFragment): number[] {
  const known = offsetsCache.get(fragment);
  if (known) return known;
  const span = layout.spans[fragment.span];
  const text = layout.text.slice(fragment.start, fragment.end);
  const raw = span
    ? spanOffsets(text, span.font)
    : text
        .split("")
        .map(() => 0)
        .concat(0);
  const natural = span ? measureSpan(text, span.font) : 0;
  // Justified spaces are wider than they measure.
  const scale = natural > 0 ? fragment.w / natural : 1;
  const offsets = raw.map((offset) => fragment.x + offset * scale);
  offsetsCache.set(fragment, offsets);
  return offsets;
}

/** The line a caret at `index` sits on: at a wrap, the start of the next line. */
export function lineIndexAt(layout: RichTextLayout, index: number): number {
  const { lines } = layout;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const next = lines[i + 1];
    if (index < line.start) return Math.max(0, i - 1);
    if (index <= line.end && !(next && next.start === index && line.end === index)) return i;
  }
  return Math.max(0, lines.length - 1);
}

/** The caret's x at `index`, on its line. */
export function caretX(layout: RichTextLayout, line: RichLine, index: number): number {
  for (const fragment of line.fragments) {
    if (index >= fragment.start && index <= fragment.end) {
      return fragmentOffsets(layout, fragment)[index - fragment.start] ?? fragment.x;
    }
  }
  const last = line.fragments[line.fragments.length - 1];
  return index <= line.start || !last ? line.x : last.x + last.w;
}

/** The caret at `index`: its x and the height of its line (in the text box's coordinates). */
export function caretRect(layout: RichTextLayout, index: number): Rect {
  const line = layout.lines[lineIndexAt(layout, index)];
  if (!line) return { x: 0, y: 0, w: 1, h: 0 };
  return { x: caretX(layout, line, index), y: line.top, w: 1, h: line.height };
}

/**
 * The highlight of characters `a` to `b`: one rect per line it touches, past a line's end when
 * the selection goes on to the next one.
 */
export function selectionRects(layout: RichTextLayout, a: number, b: number): Rect[] {
  const from = Math.min(a, b);
  const to = Math.max(a, b);
  if (from === to) return [];
  const rects: Rect[] = [];
  layout.lines.forEach((line, i) => {
    const next = layout.lines[i + 1];
    const lineEnd = next ? next.start : layout.text.length;
    if (to <= line.start || from >= lineEnd) return;
    if (from === lineEnd) return;
    const left = caretX(layout, line, Math.max(from, line.start));
    let right = caretX(layout, line, Math.min(to, line.end));
    // Selected through the line's end (its break, or the wrap): a little past it.
    if (to > line.end) right += Math.max(4, line.height * 0.25);
    rects.push({ x: left, y: line.top, w: Math.max(1, right - left), h: line.height });
  });
  return rects;
}

/** The character boundary nearest a point (in the text box's coordinates). */
export function indexAt(layout: RichTextLayout, p: Point): number {
  const { lines } = layout;
  if (lines.length === 0) return 0;
  let line = lines[lines.length - 1]!;
  for (const candidate of lines) {
    if (p.y < candidate.top + candidate.height) {
      line = candidate;
      break;
    }
  }
  return indexOnLine(layout, line, p.x);
}

/** The boundary on `line` nearest `x`. */
export function indexOnLine(layout: RichTextLayout, line: RichLine, x: number): number {
  let best = line.start;
  let distance = Math.abs(x - caretX(layout, line, line.start));
  // A caret at a wrap shows on the next line, so a wrapped line ends a character earlier.
  const next = layout.lines[layout.lines.indexOf(line) + 1];
  const last = next && next.start === line.end ? line.end - 1 : line.end;
  for (const fragment of line.fragments) {
    const offsets = fragmentOffsets(layout, fragment);
    offsets.forEach((offset, k) => {
      const index = fragment.start + k;
      if (index > last) return;
      const d = Math.abs(x - offset);
      if (d < distance) {
        distance = d;
        best = index;
      }
    });
  }
  return best;
}

/** The word (or space run) round character `index`, for double-click selection. */
export function wordRange(text: string, index: number): { start: number; end: number } {
  const isWord = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}_]/u.test(c);
  const isSpace = (c: string | undefined) => c !== undefined && /[^\S\n]/.test(c);
  const at = text[index] ?? text[index - 1];
  const same = isWord(at) ? isWord : isSpace(at) ? isSpace : (c: string | undefined) => c === at;
  let start = Math.min(index, text.length);
  let end = start;
  while (start > 0 && same(text[start - 1])) start--;
  while (end < text.length && same(text[end])) end++;
  return start === end ? { start, end: Math.min(text.length, end + 1) } : { start, end };
}
