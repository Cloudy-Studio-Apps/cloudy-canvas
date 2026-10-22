import {
  ElementKind,
  measureText,
  scaleLength,
  scalePoint,
  type ElementDescription,
  type ElementPatch,
  type ElementSpec,
  type ElementText,
  type ElementView,
  type ScaleTransform,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { INK_COLOR } from "../../palette";
import { createTextDraft } from "./text.factory";
import { drawText } from "./text.draw";
import { TEXT_DEFAULTS } from "./text.defaults";
import type { TextElement } from "./text.types";

/**
 * Free text. It's sized to its text, so it isn't resized (the Scale tool grows its font), and
 * emptying it deletes it.
 */
export class TextKind extends ElementKind<TextElement, BoardToolOptions> {
  readonly type = "text";
  readonly label = "Text";
  readonly description = "Click anywhere to type a label.";
  override readonly tool = "text";
  override readonly defaults = TEXT_DEFAULTS;
  override readonly connectable = true;
  override readonly scalable = true;
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "text",
    "color",
    "fontSize",
  ]);

  override readonly text: ElementText<TextElement> = {
    get: (el) => el.text,
    set: (el, text) => (text === el.text ? null : { text, ...measureText(text, el.fontSize) }),
    style: (el) => ({
      fontSize: el.fontSize,
      color: el.color,
      align: "left",
      vAlign: "top",
      padX: 0,
      padY: 0,
    }),
    fitContent: true,
    removeWhenEmpty: true,
  };

  draw(view: ElementView, el: TextElement): void {
    drawText(view, el);
  }

  override build(spec: ElementSpec, index: string): TextElement {
    const text = spec.text ?? "";
    if (!text.trim()) throw new Error("A text element needs some text.");
    const draft = createTextDraft({ x: 0, y: 0 }, spec.color ?? INK_COLOR, TEXT_DEFAULTS.fontSize);
    return { ...draft, index, x: spec.x, y: spec.y, text, ...measureText(text, draft.fontSize) };
  }

  /** Scaled (the Scale tool), its font grows and it's sized to its text again. */
  override scale(el: TextElement, t: ScaleTransform): ElementPatch<TextElement> {
    const fontSize = scaleLength(t, el.fontSize);
    return { ...scalePoint(t, el), fontSize, ...measureText(el.text, fontSize) };
  }

  override completePatch(
    el: TextElement,
    patch: ElementPatch<TextElement>,
  ): ElementPatch<TextElement> {
    if (patch.text === undefined && patch.fontSize === undefined) return patch;
    if (patch.text !== undefined && !patch.text.trim()) {
      throw new Error("A text element needs some text; remove it with delete_shapes instead.");
    }
    const { minFontSize, maxFontSize } = TEXT_DEFAULTS;
    if (
      patch.fontSize !== undefined &&
      (patch.fontSize < minFontSize || patch.fontSize > maxFontSize)
    ) {
      throw new Error(`"fontSize" must be between ${minFontSize} and ${maxFontSize}.`);
    }
    return { ...patch, ...measureText(patch.text ?? el.text, patch.fontSize ?? el.fontSize) };
  }

  override describe(el: TextElement): ElementDescription {
    return { label: el.text };
  }
}
