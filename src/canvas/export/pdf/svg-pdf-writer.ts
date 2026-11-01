import type { PdfColorOutput } from "./color";
import { hrefOf } from "./pdf-image";
import { PdfContent, type PdfDocument } from "./pdf-document";
import { gradientShading } from "./pdf-gradient";
import { IDENTITY, matrixOps, multiply, parseTransform, pdfNumber } from "./pdf-matrix";
import type { PdfExportOptions } from "./pdf-options.types";
import { attr, clipOps, formBox, rectOf } from "./pdf-clip";
import { pathOps } from "./pdf-path";
import { hiddenTextFont } from "./pdf-text";
import type { PdfFrame, PdfMatrix } from "./pdf-writer.types";

const PDF_BLEND: Readonly<Record<string, string>> = {
  multiply: "Multiply",
  screen: "Screen",
  overlay: "Overlay",
  darken: "Darken",
  lighten: "Lighten",
  "color-dodge": "ColorDodge",
  "color-burn": "ColorBurn",
  "hard-light": "HardLight",
  "soft-light": "SoftLight",
  difference: "Difference",
  exclusion: "Exclusion",
  hue: "Hue",
  saturation: "Saturation",
  color: "Color",
  luminosity: "Luminosity",
};
const LINE_CAPS: Readonly<Record<string, number>> = { butt: 0, round: 1, square: 2 };
const LINE_JOINS: Readonly<Record<string, number>> = { miter: 0, round: 1, bevel: 2 };

/** Writes the SVG writer's elements as PDF operators. */
export class SvgPdfWriter {
  private readonly ids = new Map<string, Element>();
  private readonly shadings = new Map<Element, number>();
  private readonly states = new Map<string, number>();

  constructor(
    private readonly doc: PdfDocument,
    private readonly root: Element,
    private readonly images: ReadonlyMap<string, number>,
    private readonly options: PdfExportOptions,
    private readonly output: PdfColorOutput,
  ) {
    for (const element of root.querySelectorAll("[id]")) this.ids.set(element.id, element);
  }

  /** The page's content; `base` takes world units to its points. */
  write(base: PdfMatrix): PdfContent {
    const out = new PdfContent();
    out.ops.push(`${matrixOps(base)} cm`);
    this.writeChildren(this.root, out, { local: base, page: base });
    return out;
  }

  private writeChildren(parent: Element, out: PdfContent, frame: PdfFrame): void {
    for (const child of parent.children) this.writeElement(child, out, frame);
  }

  private writeElement(el: Element, out: PdfContent, frame: PdfFrame): void {
    if (el.tagName === "g") this.writeGroup(el, out, frame);
    else if (el.tagName === "path")
      this.writePath(el, out, frame, pathOps(attr(el, "d"), IDENTITY));
    else if (el.tagName === "rect") this.writePath(el, out, frame, rectOf(el, IDENTITY));
    else if (el.tagName === "image") this.writeImage(el, out);
    else if (el.tagName === "use") {
      const target = this.ids.get(hrefOf(el).slice(1));
      if (target) this.writeElement(target, out, frame);
    }
  }

  private writeGroup(el: Element, out: PdfContent, frame: PdfFrame): void {
    const transform = parseTransform(el.getAttribute("transform"));
    const inner = {
      local: multiply(frame.local, transform),
      page: multiply(frame.page, transform),
    };
    out.ops.push("q", `${matrixOps(transform)} cm`);
    const clip = /url\(#(.+)\)/.exec(attr(el, "clip-path"))?.[1];
    const shape = clip ? this.ids.get(clip) : undefined;
    if (shape) out.ops.push(clipOps(shape));
    const opacity = Number(el.getAttribute("opacity") ?? 1);
    const blend = PDF_BLEND[/mix-blend-mode:([\w-]+)/.exec(attr(el, "style"))?.[1] ?? ""];
    if (opacity < 1 || blend) this.writeTogether(el, out, inner, opacity, blend);
    else this.writeChildren(el, out, inner);
    out.ops.push("Q");
  }

  /** A group with an opacity or a blend: drawn on its own, then laid on the page as one. */
  private writeTogether(
    el: Element,
    out: PdfContent,
    { page }: PdfFrame,
    opacity: number,
    blend: string | undefined,
  ): void {
    const form = new PdfContent();
    this.writeChildren(el, form, { local: IDENTITY, page });
    const ref = this.doc.content(
      `/Type /XObject /Subtype /Form /BBox [${formBox(page)}] ` +
        `/Group << /S /Transparency /CS /${this.output.space} /I true >>`,
      form,
    );
    const state = this.state(
      `/ca ${pdfNumber(opacity)} /CA ${pdfNumber(opacity)}${blend ? ` /BM /${blend}` : ""}`,
    );
    out.ops.push(`/${out.name("ExtGState", state)} gs /${out.name("XObject", ref)} Do`);
  }

  private writePath(el: Element, out: PdfContent, frame: PdfFrame, shape: string): void {
    const stroked = el.hasAttribute("stroke");
    const paint = this.paintOps(el, out, frame, stroked ? "stroke" : "fill");
    out.ops.push("q", paint);
    if (stroked) {
      out.ops.push(
        `${attr(el, "stroke-width")} w ${LINE_CAPS[attr(el, "stroke-linecap")] ?? 0} J`,
        `${LINE_JOINS[attr(el, "stroke-linejoin")] ?? 0} j ${attr(el, "stroke-miterlimit") || 10} M`,
        `${shape} S`,
      );
    } else out.ops.push(`${shape} ${el.getAttribute("fill-rule") === "evenodd" ? "f*" : "f"}`);
    out.ops.push("Q");
    this.writeHiddenText(el, out);
  }

  /** The operators setting an element's color or gradient and its opacity. */
  private paintOps(
    el: Element,
    out: PdfContent,
    { local }: PdfFrame,
    attribute: "fill" | "stroke",
  ): string {
    const paint = attr(el, attribute);
    const stroke = attribute === "stroke";
    const [space, pattern, alpha] = stroke ? ["CS", "SCN", "CA"] : ["cs", "scn", "ca"];
    const opacity = el.getAttribute(`${attribute}-opacity`);
    const faded = opacity
      ? `/${out.name("ExtGState", this.state(`/${alpha} ${opacity}`))} gs `
      : "";
    const gradient = this.ids.get(/url\(#(.+)\)/.exec(paint)?.[1] ?? "");
    if (!gradient) return `${faded}${this.output.paint(paint, stroke)}`;
    let shading = this.shadings.get(gradient);
    if (!shading) {
      shading = gradientShading(this.doc, gradient, this.output);
      this.shadings.set(gradient, shading);
    }
    const matrix = multiply(local, parseTransform(gradient.getAttribute("gradientTransform")));
    const ref = this.doc.add(
      `<< /Type /Pattern /PatternType 2 /Shading ${shading} 0 R /Matrix [${matrixOps(matrix)}] >>`,
    );
    return `${faded}/Pattern ${space} /${out.name("Pattern", ref)} ${pattern}`;
  }

  private writeHiddenText(el: Element, out: PdfContent): void {
    const text = el.getAttribute("data-text");
    if (text === null || this.options.text !== "selectable") return;
    const font = hiddenTextFont(this.doc);
    const ops = font.ops(
      out.name("Font", font.ref),
      text,
      Number(el.getAttribute("data-x")),
      Number(el.getAttribute("data-y")),
      Number(el.getAttribute("data-size")),
      Number(el.getAttribute("data-width")),
    );
    if (ops) out.ops.push(`q ${ops} Q`);
  }

  private writeImage(el: Element, out: PdfContent): void {
    const ref = this.images.get(hrefOf(el));
    if (ref === undefined) return;
    const x = Number(el.getAttribute("x") ?? 0);
    const y = Number(el.getAttribute("y") ?? 0);
    const w = Number(el.getAttribute("width"));
    const h = Number(el.getAttribute("height"));
    // An image fills the unit square with its top at y = 1.
    const place: PdfMatrix = [w, 0, 0, -h, x, y + h];
    out.ops.push(`q ${matrixOps(place)} cm /${out.name("XObject", ref)} Do Q`);
  }

  private state(entries: string): number {
    let ref = this.states.get(entries);
    if (ref === undefined) {
      ref = this.doc.add(`<< /Type /ExtGState ${entries} >>`);
      this.states.set(entries, ref);
    }
    return ref;
  }
}
