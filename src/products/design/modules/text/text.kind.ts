import type {
  ElementBuildContext,
  ElementPatch,
  ElementSpec,
  ElementText,
  ElementView,
  Rect,
} from "@canvas";
import type { FontRequest } from "@shared/core";

import { colorPaints, DesignNodeKind, type NodeBuildContext } from "../core";
import { TEXT_DEFAULTS } from "./text.defaults";
import { retypeset } from "./retypeset";
import { TEXT_SPEC_PROPERTIES, textFields } from "./text-args";
import { createText } from "./text.factory";
import { textSize, textStyleOf } from "./text-layout";
import type { TextNodeElement } from "./text.types";

/** Longest layer name a text takes from its content. */
const NAME_LENGTH = 60;

/**
 * Text layers: typed in place, in any installed or Google font, sized to their text (auto width
 * or height) or fixed. Named after their first line until renamed.
 */
export class TextKind extends DesignNodeKind<TextNodeElement> {
  readonly type = "text";
  readonly label = "Text";
  readonly description = "Text in any font: click to type, or drag for a fixed width.";
  override readonly tool = "text";
  override readonly defaults = TEXT_DEFAULTS;
  override readonly imageFills = false;
  override readonly strokable = false;
  override readonly creatable = true;
  override readonly specProperties = TEXT_SPEC_PROPERTIES;

  override readonly text: ElementText<TextNodeElement> = {
    get: (el) => el.text,
    set: (el, text) => (text === el.text ? null : { text, ...textSize(el, text) }),
    style: (el) => textStyleOf(el),
    sizing: (el) =>
      el.autoResize === "width" ? "content" : el.autoResize === "height" ? "height" : "fixed",
    removeWhenEmpty: true,
  };

  draw(view: ElementView, el: TextNodeElement): void {
    const fill = el.fills.find((paint) => paint.visible && paint.type === "solid");
    const text = view.placeText(el.text, textStyleOf(el), el.w, el.h);
    text.visible = el.visible && fill !== undefined;
    text.alpha = el.opacity * (fill?.opacity ?? 1);
  }

  override layerName(el: TextNodeElement): string {
    return el.name || el.text.split("\n")[0]?.trim().slice(0, NAME_LENGTH) || this.label;
  }

  /**
   * Dragging a side fixes the width (auto width becomes auto height), and dragging the height
   * fixes the size; the text is laid out again for the new box.
   */
  override resize(el: TextNodeElement, rect: Rect): ElementPatch<TextNodeElement> {
    const autoResize =
      rect.h !== el.h
        ? "none"
        : rect.w !== el.w && el.autoResize === "width"
          ? "height"
          : el.autoResize;
    return retypeset(el, { ...rect, autoResize });
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
    const base = createText(spec, index, null, context.options.textTypography, spec.w);
    const fixed = spec.w !== undefined && spec.h !== undefined;
    const el: TextNodeElement = {
      ...base,
      ...(spec.color !== undefined ? { fills: colorPaints(spec.color, "color") } : {}),
      ...(fixed ? { w: spec.w!, h: spec.h!, autoResize: "none" } : {}),
    };
    return { ...el, ...retypeset(el, fields) };
  }

  /** Changes to its text or typography lay it out again. */
  override completePatch(
    el: TextNodeElement,
    patch: ElementPatch<TextNodeElement>,
    context: ElementBuildContext,
  ): ElementPatch<TextNodeElement> {
    const fields = textFields(patch);
    const next = Object.keys(fields).length > 0 ? retypeset({ ...el, ...patch }, fields) : {};
    return super.completePatch(el, { ...patch, ...next }, context);
  }

  override fonts(el: TextNodeElement): FontRequest[] {
    return [{ family: el.fontFamily, weight: el.fontWeight, style: el.fontStyle }];
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
    };
  }
}
