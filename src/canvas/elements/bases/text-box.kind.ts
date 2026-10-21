import type { ElementDescription, ElementText, ElementTextStyle } from "../element.kind.types";
import type { ElementPatch } from "../element.types";
import { BoxKind } from "./box.kind";
import type { TextBoxElement } from "./text-box.kind.types";

/**
 * Box elements whose `text` is edited in place. Reading, writing and describing the text is the
 * same for all of them; subclasses only say how it's laid out.
 */
export abstract class TextBoxKind<
  E extends TextBoxElement,
  O extends object = object,
> extends BoxKind<E, O> {
  override readonly text: ElementText<E> = {
    get: (el) => el.text,
    set: (el, text) => (text === el.text ? null : ({ text } as ElementPatch<E>)),
    style: (el) => this.textStyle(el),
  };

  /** How the text is laid out, shared by the drawer and the text editor. */
  protected abstract textStyle(el: E): ElementTextStyle;

  override describe(el: E): ElementDescription {
    return { label: el.text };
  }
}
