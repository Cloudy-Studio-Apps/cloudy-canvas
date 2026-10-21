import type { ElementPatch, ElementText, ElementTextStyle, Size } from "@canvas";

import { ErKind } from "./er.kind";
import type { ErNamedElement } from "./er.types";

/**
 * ER elements whose name is edited in place, on one line (Enter finishes). Clearing the name keeps
 * the previous one; elements sized by their name resize round their center.
 */
export abstract class ErNamedKind<E extends ErNamedElement> extends ErKind<E> {
  override readonly text: ElementText<E> = {
    get: (el) => el.name,
    set: (el, text) => this.rename(el, text.trim()),
    style: (el) => ({ ...this.textStyle(el), singleLine: true }),
  };

  /** How the name is laid out, shared by the drawer and the text editor. */
  protected abstract textStyle(el: E): ElementTextStyle;

  /** The size the element needs for a name, or `null` when its size doesn't follow the name. */
  protected nameSize(_el: E, _name: string): Size | null {
    return null;
  }

  private rename(el: E, name: string): ElementPatch<E> | null {
    if (!name || name === el.name) return null;
    const size = this.nameSize(el, name);
    if (!size) return { name } as ElementPatch<E>;
    return {
      name,
      ...size,
      x: Math.round(el.x + el.w / 2 - size.w / 2),
      y: Math.round(el.y + el.h / 2 - size.h / 2),
    } as ElementPatch<E>;
  }
}
