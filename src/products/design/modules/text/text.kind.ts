import {
  type BindableField,
  type ResolvedValue,
  normalizePath,
  runsForText,
  scaleLength,
  scaleRect,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type ElementStyle,
  type ElementText,
  type ElementView,
  type Rect,
  type RichTextSpec,
  type ScaleTransform,
} from "@canvas";
import type { FontRequest, GlyphOutliner } from "@shared/core";

import {
  colorPaints,
  DesignNodeKind,
  drawPaints,
  NODE_STYLE_FIELDS,
  type LayoutAxis,
  type LayoutSizing,
  type NodeBuildContext,
  type NodeGeometry,
  numberField,
  stringField,
} from "../core";
import { TEXT_DEFAULTS } from "./text.defaults";
import { readTextStyle, TEXT_STYLE, TEXT_STYLE_PATH } from "./text-style";
import { retypeset } from "./retypeset";
import { faceFromName } from "./text-face-name";
import { applyRunStyle, RUN_STYLE_PREFIX, runStyleIds } from "./apply-run-style";
import { TEXT_SPEC_PROPERTIES, textFields } from "./text-args";
import { createText } from "./text.factory";
import { textLayout, textSize, textStyleOf } from "./text-layout";
import { textContentPatch, TEXT_RICH } from "./text-rich-spec";
import { readRuns, runsPatch } from "./text-run-args";
import { textOutline } from "./text-outline";
import { autoResizeFor } from "./text-auto-resize";
import type { TextNodeElement } from "./text.types";
import { t } from "./text.i18n";

/** Longest layer name a text takes from its content. */
const NAME_LENGTH = 60;

/** The bindable fields whose change lays the text out again. */
const TYPOGRAPHY_PATHS = new Set([
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "fontWeight",
  "fontFamily",
  "fontStyle",
  TEXT_STYLE_PATH,
]);

/**
 * Text layers: typed in place, in any installed or Google font, sized to their text (auto width
 * or height) or fixed, with ranges styled their own way (`runs`). Named after their first line
 * until renamed.
 */
export class TextKind extends DesignNodeKind<TextNodeElement> {
  readonly type = "text";
  readonly label = t("label");
  readonly description = t("description");
  override readonly tool = "text";
  override readonly defaults = TEXT_DEFAULTS;
  override readonly strokable = false;
  override readonly fillScope = "text-fill";

  /** Its type's size, line height, letter spacing and weight. */
  override bindable(el: TextNodeElement): BindableField[] {
    return [
      ...super.bindable(el),
      numberField("fontSize", "font-size", t("fields.fontSize")),
      numberField("lineHeight", "line-height", t("fields.lineHeight")),
      numberField("letterSpacing", "letter-spacing", t("fields.letterSpacing")),
      numberField("fontWeight", "font-weight", t("fields.fontWeight")),
      stringField("text", "text-content", t("fields.text")),
      stringField("fontFamily", "font-family", t("fields.font")),
      stringField("fontStyle", "font-style", t("fields.fontStyle")),
      {
        path: TEXT_STYLE_PATH,
        type: "style",
        styleType: TEXT_STYLE,
        scopes: [],
        label: t("styles.textStyle"),
      },
      // Each text style its ranges use.
      ...runStyleIds(el.runs).map((id): BindableField => ({
        path: `${RUN_STYLE_PREFIX}${id}`,
        type: "style",
        styleType: TEXT_STYLE,
        scopes: [],
        label: t("styles.rangeStyle"),
      })),
    ];
  }

  override bindValues(
    el: TextNodeElement,
    path: string,
    value: ResolvedValue,
  ): Record<string, unknown> {
    // A text style sets the typography it holds.
    if (value.type === "style" && path === TEXT_STYLE_PATH) {
      return value.styleType === TEXT_STYLE ? readTextStyle(value.value) : {};
    }
    if (value.type === "style" && path.startsWith(RUN_STYLE_PREFIX)) {
      if (value.styleType !== TEXT_STYLE) return {};
      const id = path.slice(RUN_STYLE_PREFIX.length);
      return { runs: applyRunStyle(el.runs, id, readTextStyle(value.value)) };
    }
    if (value.type === "number") {
      const n = value.number;
      if (path === "fontSize") return { fontSize: Math.max(1, n) };
      if (path === "lineHeight") return { lineHeight: Math.max(0, n) };
      // Weights are stored as their CSS names ("400").
      if (path === "fontWeight") {
        return { fontWeight: String(Math.min(900, Math.max(100, Math.round(n / 100) * 100))) };
      }
    }
    if (value.type === "string") {
      if (path === "fontStyle") return { ...faceFromName(value.string) };
      // An empty family would draw nothing: the field keeps what it has.
      if (path === "fontFamily" && !value.string.trim()) return {};
    }
    return super.bindValues(el, path, value);
  }

  /** Typography laid out again, as any change of it is. */
  override bindPatch(
    el: TextNodeElement,
    path: string,
    value: ResolvedValue,
  ): ElementPatch<TextNodeElement> | null {
    // Content goes through the text's own `set`, so its ranges move with it.
    if (path === "text" && value.type === "string") return this.text.set(el, value.string);
    const patch = super.bindPatch(el, path, value);
    if (!patch || !(TYPOGRAPHY_PATHS.has(path) || path.startsWith(RUN_STYLE_PREFIX))) return patch;
    return retypeset(el, patch);
  }
  override readonly creatable = true;
  override readonly specProperties = TEXT_SPEC_PROPERTIES;
  override readonly styleFields = [
    ...NODE_STYLE_FIELDS,
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "verticalAlign",
    "textDecoration",
  ];

  /**
   * `outliner` gives its glyphs' outlines (flattening it, booleans and vector masks made of it);
   * without one, a text has no shape.
   */
  constructor(private readonly outliner: GlyphOutliner | null = null) {
    super();
  }

  /** Its glyphs, laid out as drawn; worked out again once its face can be outlined. */
  override geometryKey(el: TextNodeElement): string {
    const ready = this.fonts(el).every((font) => this.outliner?.ready(font) ?? false);
    return [
      JSON.stringify(el.runs),
      el.textDecoration,
      el.text,
      el.fontFamily,
      el.fontWeight,
      el.fontStyle,
      el.fontSize,
      el.lineHeight,
      el.letterSpacing,
      el.textAlign,
      el.verticalAlign,
      el.autoResize,
      el.w,
      el.h,
      ready,
    ].join("|");
  }

  /** Its glyphs' outlines (holes open), `null` while its face is being read. */
  protected override buildGeometry(el: TextNodeElement): NodeGeometry | null {
    if (!this.outliner) return null;
    const glyphs = textOutline(el, this.outliner);
    if (!glyphs) return null;
    const fill = normalizePath(glyphs, "nonzero");
    return { fill, stroke: fill };
  }

  override readonly text: ElementText<TextNodeElement> = {
    get: (el) => el.text,
    // Ranges follow the change (what's typed takes the style before it).
    set: (el, text) => textContentPatch(el, text, runsForText(el.runs, el.text, text)),
    style: (el) => textStyleOf(el),
    sizing: (el) =>
      el.autoResize === "width" ? "content" : el.autoResize === "height" ? "height" : "fixed",
    removeWhenEmpty: true,
    rich: TEXT_RICH as unknown as RichTextSpec<TextNodeElement>,
  };

  /**
   * Its text laid out by the engine (`textLayout`), each range in its own font and color. When
   * the text's own fills are anything but one solid color (gradients, images, several paints),
   * they're drawn in its box and show through its glyphs, as in Figma.
   */
  draw(view: ElementView, el: TextNodeElement): void {
    const fills = el.fills.filter((paint) => paint.visible);
    const [fill] = fills;
    const plain = fills.length === 0 || (fills.length === 1 && fill?.type === "solid");
    view.placeRichText(textLayout(el), el.visible ? el.opacity : 0);
    if (plain) {
      view.setPaints([], { alpha: 1, visible: false });
      view.setPaintTextMask(false);
      return;
    }
    drawPaints(view, { ...el, strokes: [] }, (g) => g.rect(0, 0, el.w, el.h));
    view.setPaintTextMask(true);
  }

  /** Auto width hugs both ways, auto height its height. */
  override hugs(el: TextNodeElement, axis: LayoutAxis): boolean {
    return el.autoResize === "width" || (axis === "v" && el.autoResize === "height");
  }

  /** Flipped, its glyphs are drawn mirrored, as in Figma. */
  override mirrorsOnFlip(): boolean {
    return true;
  }

  /** A text hugs through its auto size, whatever it is now. */
  override canHug(): boolean {
    return true;
  }

  /**
   * Hugging is its `autoResize` (auto width hugs both ways, auto height its height); fixing a side
   * stops it, and filling across makes it wrap (auto height).
   */
  override sizingPatch(
    el: TextNodeElement,
    axis: LayoutAxis,
    sizing: LayoutSizing,
  ): ElementPatch<TextNodeElement> {
    const stored = { ...el.sizing, [axis]: sizing === "fill" ? "fill" : "fixed" };
    const autoResize = autoResizeFor(el.autoResize, axis, sizing);
    return retypeset(el, { sizing: stored, autoResize });
  }

  override baseline(el: TextNodeElement): number | null {
    return textLayout(el).lines[0]?.baseline ?? null;
  }

  override layerName(el: TextNodeElement): string {
    return el.name || el.text.split("\n")[0]?.trim().slice(0, NAME_LENGTH) || this.label;
  }

  /**
   * Dragging a side fixes the width (auto width becomes auto height), and dragging the height
   * fixes the size; the text is laid out again for the new box.
   */
  protected override resizeShape(el: TextNodeElement, rect: Rect): ElementPatch<TextNodeElement> {
    const autoResize =
      rect.h !== el.h
        ? "none"
        : rect.w !== el.w && el.autoResize === "width"
          ? "height"
          : el.autoResize;
    return retypeset(el, { ...rect, autoResize });
  }

  /**
   * Scaled (the Scale tool), its font size and letter spacing grow with it (the line height is a
   * multiple of the size) and the text is laid out again in its scaled box.
   */
  override scale(el: TextNodeElement, t: ScaleTransform): ElementPatch<TextNodeElement> {
    const { x, y, w, h } = scaleRect(t, el);
    const fontSize = scaleLength(t, el.fontSize);
    // Ranges with their own size and spacing scale with it.
    const runs = el.runs.map((run) => ({
      ...run,
      style: {
        ...run.style,
        ...(run.style.fontSize !== undefined
          ? { fontSize: scaleLength(t, run.style.fontSize) }
          : {}),
        ...(run.style.letterSpacing !== undefined
          ? { letterSpacing: scaleLength(t, run.style.letterSpacing) }
          : {}),
      },
    }));
    const letterSpacing = scaleLength(t, el.letterSpacing);
    return retypeset(el, { x, y, w, h, fontSize, letterSpacing, runs });
  }

  /**
   * An agent's text, in the typography new texts use unless the spec says otherwise: auto width,
   * or wrapped at `w` (auto height), or a fixed `w`×`h`. `color` is its fill.
   */
  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): TextNodeElement {
    const fields = textFields(spec.args);
    if (fields.text === undefined) throw new Error('A text needs "text".');
    if (spec.args.runs !== undefined) fields.runs = readRuns(spec.args.runs, fields.text.length);
    const base = createText(spec, index, null, context.options.textTypography, spec.w);
    const fixed = spec.w !== undefined && spec.h !== undefined;
    const el: TextNodeElement = {
      ...base,
      ...(spec.color !== undefined ? { fills: colorPaints(spec.color, "color") } : {}),
      ...(fixed ? { w: spec.w!, h: spec.h!, autoResize: "none" } : {}),
    };
    return { ...el, ...retypeset(el, fields) };
  }

  /**
   * Changes to its text or typography lay it out again. Its ranges follow a new text (as typing
   * does), and a field set for the whole text is cleared from them (as in Figma), unless the
   * patch gives `runs`.
   */
  override completePatch(
    el: TextNodeElement,
    patch: ElementPatch<TextNodeElement>,
    context: ElementBuildContext,
  ): ElementPatch<TextNodeElement> {
    const fields = { ...textFields(patch), ...runsPatch(el, patch) };
    const next = Object.keys(fields).length > 0 ? retypeset({ ...el, ...patch }, fields) : {};
    return super.completePatch(el, { ...patch, ...next }, context);
  }

  /** A pasted look sets its type again: an auto-sized text takes its new size. */
  override applyStyle(el: TextNodeElement, style: ElementStyle): ElementPatch<TextNodeElement> {
    const patch = super.applyStyle(el, style);
    return Object.keys(patch).length > 0 ? retypeset(el, patch) : patch;
  }

  /** The faces it's drawn in: its own, and each range's. */
  override fonts(el: TextNodeElement): FontRequest[] {
    const faces = new Map<string, FontRequest>();
    for (const style of [{}, ...el.runs.map((run) => run.style)]) {
      const face: FontRequest = {
        family: style.fontFamily ?? el.fontFamily,
        weight: style.fontWeight ?? el.fontWeight,
        style: style.fontStyle ?? el.fontStyle,
      };
      faces.set(`${face.family}|${face.weight}|${face.style}`, face);
    }
    return [...faces.values()];
  }

  /** Its font measures differently once loaded: auto-sized text takes its new size. */
  override fontsLoaded(el: TextNodeElement): ElementPatch<TextNodeElement> | null {
    const size = textSize(el);
    const changed =
      (size.w !== undefined && size.w !== el.w) || (size.h !== undefined && size.h !== el.h);
    return changed ? size : null;
  }

  override fillDefaults(el: TextNodeElement): TextNodeElement {
    const typography = TEXT_DEFAULTS.typography;
    return {
      ...super.fillDefaults(el),
      text: el.text ?? "",
      fontFamily: el.fontFamily ?? typography.fontFamily,
      fontSize: el.fontSize ?? typography.fontSize,
      fontWeight: el.fontWeight ?? typography.fontWeight,
      fontStyle: el.fontStyle ?? typography.fontStyle,
      lineHeight: el.lineHeight ?? typography.lineHeight,
      letterSpacing: el.letterSpacing ?? typography.letterSpacing,
      textAlign: el.textAlign ?? "left",
      verticalAlign: el.verticalAlign ?? "top",
      autoResize: el.autoResize ?? "width",
      textDecoration: el.textDecoration ?? "none",
      runs: el.runs ?? [],
    };
  }
}
