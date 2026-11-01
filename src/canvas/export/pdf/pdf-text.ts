import { strToU8, zlibSync } from "fflate";

import { blankFontBytes } from "./pdf-blank-font";
import type { PdfDocument } from "./pdf-document";
import { pdfNumber } from "./pdf-matrix";

/** How wide each character counts as, in thousandths of the size: runs are stretched to fit. */
const CHAR_WIDTH = 500;
const FONT_NAME = "AAAAAA+CloudyHiddenText";
/** The empty glyph every character draws. */
const BLANK_GLYPH = 1;
/** A CMap section holds at most this many entries. */
const CMAP_SECTION = 100;

const hex = (value: number, digits: number) =>
  value.toString(16).toUpperCase().padStart(digits, "0");

/**
 * The hidden text layer's font, as OCR tools do it: every character draws one empty glyph of one
 * width, so a run can be stretched to its outlines' exact width, and a table (`/ToUnicode`) says
 * what each code really is, for searching and copying. Codes are given out as characters first
 * appear, so any character fits and the document's pages share one font.
 */
export class HiddenTextFont {
  readonly ref: number;
  private readonly codes = new Map<string, number>();

  constructor(private readonly doc: PdfDocument) {
    this.ref = doc.reserve();
    doc.beforeSave(() => this.write());
  }

  /** The operators of a run on its baseline, as wide as its outlines; empty with no text. */
  ops(font: string, text: string, x: number, baseline: number, size: number, width: number) {
    const chars = [...text].filter((char) => (char.codePointAt(0) ?? 0) >= 32);
    if (chars.length === 0 || size <= 0) return "";
    const stretch = (width / (chars.length * (CHAR_WIDTH / 1000) * size)) * 100;
    const string = chars.map((char) => hex(this.code(char), 4)).join("");
    return (
      `BT 3 Tr /${font} ${pdfNumber(size)} Tf ${pdfNumber(stretch)} Tz ` +
      `1 0 0 -1 ${pdfNumber(x)} ${pdfNumber(baseline)} Tm <${string}> Tj ET`
    );
  }

  private code(char: string): number {
    let code = this.codes.get(char);
    if (code === undefined) this.codes.set(char, (code = this.codes.size + 1));
    return code;
  }

  private write(): void {
    const { doc } = this;
    const bytes = blankFontBytes();
    const file = doc.stream(`/Length1 ${bytes.length} /Filter /FlateDecode`, zlibSync(bytes));
    const descriptor = doc.add(
      `<< /Type /FontDescriptor /FontName /${FONT_NAME} /Flags 5 /FontBBox [0 0 500 1000] ` +
        `/ItalicAngle 0 /Ascent 1000 /Descent 0 /CapHeight 1000 /StemV 80 /FontFile2 ${file} 0 R >>`,
    );
    const glyphs = doc.stream("/Filter /FlateDecode", zlibSync(this.glyphMap()));
    const descendant = doc.add(
      `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${FONT_NAME} ` +
        `/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ` +
        `/FontDescriptor ${descriptor} 0 R /DW ${CHAR_WIDTH} /CIDToGIDMap ${glyphs} 0 R >>`,
    );
    const unicode = doc.stream("/Filter /FlateDecode", zlibSync(strToU8(this.toUnicode())));
    doc.fill(
      this.ref,
      `<< /Type /Font /Subtype /Type0 /BaseFont /${FONT_NAME} /Encoding /Identity-H ` +
        `/DescendantFonts [${descendant} 0 R] /ToUnicode ${unicode} 0 R >>`,
    );
  }

  /** Every code to the empty glyph. */
  private glyphMap(): Uint8Array {
    const map = new Uint8Array((this.codes.size + 1) * 2);
    for (let code = 1; code <= this.codes.size; code++) map[code * 2 + 1] = BLANK_GLYPH;
    return map;
  }

  /** The CMap from codes back to characters, in UTF-16 as PDF wants. */
  private toUnicode(): string {
    const entries = [...this.codes].map(([char, code]) => {
      const units = Array.from({ length: char.length }, (_, i) => char.charCodeAt(i));
      return `<${hex(code, 4)}> <${units.map((unit) => hex(unit, 4)).join("")}>`;
    });
    const sections: string[] = [];
    for (let i = 0; i < entries.length; i += CMAP_SECTION) {
      const part = entries.slice(i, i + CMAP_SECTION);
      sections.push(`${part.length} beginbfchar\n${part.join("\n")}\nendbfchar`);
    }
    return [
      "/CIDInit /ProcSet findresource begin",
      "12 dict begin",
      "begincmap",
      "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
      "/CMapName /Adobe-Identity-UCS def",
      "/CMapType 2 def",
      "1 begincodespacerange",
      "<0000> <FFFF>",
      "endcodespacerange",
      ...sections,
      "endcmap",
      "CMapName currentdict /CMap defineresource pop",
      "end",
      "end",
    ].join("\n");
  }
}

const fonts = new WeakMap<PdfDocument, HiddenTextFont>();

/** The document's hidden text font, shared by its pages. */
export function hiddenTextFont(doc: PdfDocument): HiddenTextFont {
  let font = fonts.get(doc);
  if (!font) fonts.set(doc, (font = new HiddenTextFont(doc)));
  return font;
}
