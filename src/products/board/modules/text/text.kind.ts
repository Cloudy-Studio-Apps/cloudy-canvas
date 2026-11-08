import {
  ElementKind,
  scaleLength,
  scalePoint,
  type ElementDescription,
  type ElementPatch,
  type ElementSpec,
  type ElementStyle,
  type ElementText,
  type ElementView,
  type ScaleTransform,
  type BindableField,
  type FontWeight,
  type Rect,
} from "@canvas";

import { colorField } from "../../tokens";
import type { BoardToolOptions } from "../../board-options.types";
import { INK_COLOR } from "../../palette";
import { createTextDraft } from "./text.factory";
import { drawText } from "./text.draw";
import { TEXT_DEFAULTS } from "./text.defaults";
import { fitLabel, labelStyle, measureLabel } from "./text-measure";
import { clampFontSize, restyleText, textOptionsOf } from "./text-options";
import { checkTextPatch } from "./text-patch";
import type { TextElement } from "./text.types";
import { t } from "./text.i18n";

/** The fields that change the size its text takes. */
const FONT_FIELDS = ["fontSize", "fontWeight", "fontStyle", "wrap"] as const;

/** The narrowest a fixed-width label gets, in font sizes (about one letter). */
const MIN_WIDTH_EM = 1;

/**
 * Free text. It's sized to its text (auto width) until a handle resizes it: then it keeps that
 * width, its lines wrap and its height follows them (fixed width). The Scale tool and the panel
 * set its font size, and emptying it deletes it.
 */
export class TextKind extends ElementKind<TextElement, BoardToolOptions> {
  readonly type = "text";
  readonly label = t("label");
  readonly description = t("description");
  override readonly tool = "text";
  override readonly defaults = TEXT_DEFAULTS;
  override readonly styleFields = ["color", "fontSize", "fontWeight", "fontStyle", "align"];
  override readonly connectable = true;
  override readonly scalable = true;
  override readonly resizable = true;
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "text",
    "color",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "align",
    "wrap",
  ]);

  override readonly text: ElementText<TextElement> = {
    get: (el) => el.text,
    set: (el, text) => (text === el.text ? null : { text, ...fitLabel({ ...el, text }) }),
    style: labelStyle,
    sizing: (el) => (el.wrap ? "height" : "content"),
    removeWhenEmpty: true,
  };

  draw(view: ElementView, el: TextElement): void {
    drawText(view, el);
  }

  override build(spec: ElementSpec, index: string): TextElement {
    const text = spec.text ?? "";
    if (!text.trim()) throw new Error("A text element needs some text.");
    const draft = createTextDraft({ x: 0, y: 0 }, spec.color ?? INK_COLOR, TEXT_DEFAULTS.fontSize);
    return {
      ...draft,
      index,
      x: spec.x,
      y: spec.y,
      text,
      ...measureLabel(text, draft.fontSize, draft),
    };
  }

  /**
   * Dragging a handle fixes its width (the height is its wrapped text's, whatever the handle);
   * the side not dragged stays put.
   */
  override resize(el: TextElement, rect: Rect): ElementPatch<TextElement> {
    const w = Math.max(Math.round(rect.w), Math.ceil(el.fontSize * MIN_WIDTH_EM));
    const x = rect.x !== el.x ? Math.round(rect.x + rect.w - w) : el.x;
    return { x, y: el.y, wrap: true, ...fitLabel({ ...el, wrap: true, w }) };
  }

  /** Scaled (the Scale tool), its font (and a fixed width) grows and it's laid out again. */
  override scale(el: TextElement, t: ScaleTransform): ElementPatch<TextElement> {
    const fontSize = scaleLength(t, el.fontSize);
    const w = el.wrap ? scaleLength(t, el.w) : el.w;
    return { ...scalePoint(t, el), fontSize, ...fitLabel({ ...el, fontSize, w }) };
  }

  /** A pasted font (its size within its limits) sizes it to its text again. */
  override applyStyle(el: TextElement, style: ElementStyle): ElementPatch<TextElement> {
    const patch = super.applyStyle(el, style);
    if (!FONT_FIELDS.some((field) => patch[field] !== undefined)) return patch;
    const fontSize = clampFontSize(patch.fontSize ?? el.fontSize);
    const next = { ...el, ...patch, fontSize };
    return { ...patch, fontSize, ...fitLabel(next) };
  }

  override completePatch(
    el: TextElement,
    patch: ElementPatch<TextElement>,
  ): ElementPatch<TextElement> {
    checkTextPatch(patch);
    // Agents may send a weight as a number.
    if (patch.fontWeight !== undefined) {
      patch = { ...patch, fontWeight: String(patch.fontWeight) as FontWeight };
    }
    if (patch.text === undefined && !FONT_FIELDS.some((field) => patch[field] !== undefined)) {
      return patch;
    }
    const next = { ...el, ...patch };
    return { ...patch, ...fitLabel(next) };
  }

  /** Its color binds to a color variable. */
  override bindable(): BindableField[] {
    return [colorField("color", t("color"), "text-fill")];
  }

  override describe(el: TextElement): ElementDescription {
    return { label: el.text };
  }

  override optionsOf(el: TextElement): Partial<BoardToolOptions> {
    return textOptionsOf(el);
  }

  override restyle(el: TextElement, options: Partial<BoardToolOptions>): ElementPatch<TextElement> {
    return restyleText(el, options);
  }
}
