import {
  fontKey,
  type FontRequest,
  type GlyphContour,
  type GlyphOutliner,
  type GlyphPoint,
  type ShapedGlyph,
} from "@shared/core";
import { fontLibrary } from "./font-library";
import type { FaceState, HarfBuzz, OpenFace } from "./glyph-outliner.types";

let harfbuzz: Promise<HarfBuzz> | null = null;
const faces = new Map<string, FaceState>();
const listeners = new Set<(font: FontRequest) => void>();

/**
 * Glyph outlines through HarfBuzz (its WASM is loaded the first time text is outlined): each face
 * is read once from its font file (`FontLibrary.fontData`), shaped lines come out in pixels.
 */
export const glyphOutliner: GlyphOutliner = {
  ready: (font) => faces.get(fontKey(font))?.status === "ready",
  shape(font, text, size) {
    const face = faceOf(font);
    if (face.status !== "ready") return null;
    const hb = loadedHarfBuzz;
    if (!hb) return null;
    const buffer = new hb.Buffer();
    buffer.addText(text);
    buffer.guessSegmentProperties();
    hb.shape(face.font, buffer);
    const scale = size / face.upem;
    const infos = buffer.getGlyphInfos();
    const positions = buffer.getGlyphPositions();
    const glyphs: ShapedGlyph[] = infos.map((info, i) => {
      const position = positions[i];
      const dx = (position?.xOffset ?? 0) * scale;
      const dy = -(position?.yOffset ?? 0) * scale;
      const place = (p: GlyphPoint): GlyphPoint => ({ x: p.x * scale + dx, y: -p.y * scale + dy });
      return {
        advance: (position?.xAdvance ?? 0) * scale,
        contours: outlineOf(face, info.codepoint).map((contour) => ({
          start: place(contour.start),
          segments: contour.segments.map(({ c1, c2, to }) => ({
            c1: place(c1),
            c2: place(c2),
            to: place(to),
          })),
          closed: contour.closed,
        })),
      };
    });
    return { glyphs, ascent: face.ascender * scale, descent: -face.descender * scale };
  },
  onReady(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** The HarfBuzz module once it's loaded (shaping is synchronous). */
let loadedHarfBuzz: HarfBuzz | null = null;

/** A face's state, starting to read it the first time it's asked for. */
function faceOf(font: FontRequest): FaceState {
  const key = fontKey(font);
  const known = faces.get(key);
  if (known) return known;
  faces.set(key, { status: "loading" });
  void openFace(font)
    .catch(() => null)
    .then((face) => {
      faces.set(key, face ? { status: "ready", ...face } : { status: "failed" });
      if (face) for (const listener of listeners) listener(font);
    });
  return { status: "loading" };
}

async function openFace(font: FontRequest): Promise<OpenFace | null> {
  harfbuzz ??= import("harfbuzzjs");
  const [hb, data] = await Promise.all([harfbuzz, fontLibrary.fontData(font)]);
  loadedHarfBuzz = hb;
  if (!data) return null;
  const face = new hb.Face(new hb.Blob(data.bytes), data.index);
  const hbFont = new hb.Font(face);
  // Variable faces take the weight asked for; static ones ignore the axis.
  hbFont.setVariations([new hb.Variation("wght", Number(font.weight))]);
  const { ascender, descender } = hbFont.hExtents();
  return { font: hbFont, upem: face.upem, ascender, descender, glyphs: new Map() };
}

/** A glyph's outlines in font units (y up), drawn once per face. */
function outlineOf(face: OpenFace, glyph: number): GlyphContour[] {
  const known = face.glyphs.get(glyph);
  if (known) return known;
  const hb = loadedHarfBuzz!;
  const contours: GlyphContour[] = [];
  let current: GlyphContour | null = null;
  let at: GlyphPoint = { x: 0, y: 0 };
  const draw = new hb.DrawFuncs();
  draw.setMoveToFunc((x, y) => {
    current = { start: { x, y }, segments: [], closed: false };
    contours.push(current);
    at = { x, y };
  });
  draw.setLineToFunc((x, y) => {
    current?.segments.push({ c1: at, c2: { x, y }, to: { x, y } });
    at = { x, y };
  });
  draw.setCubicToFunc((c1x, c1y, c2x, c2y, x, y) => {
    current?.segments.push({ c1: { x: c1x, y: c1y }, c2: { x: c2x, y: c2y }, to: { x, y } });
    at = { x, y };
  });
  draw.setClosePathFunc(() => {
    if (!current) return;
    // A closed contour's last segment ends back at its start.
    const { start } = current;
    if (at.x !== start.x || at.y !== start.y) {
      current.segments.push({ c1: at, c2: start, to: start });
    }
    current.closed = true;
    at = start;
  });
  face.font.drawGlyph(glyph, draw);
  face.glyphs.set(glyph, contours);
  return contours;
}
