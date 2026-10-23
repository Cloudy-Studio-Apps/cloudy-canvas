import type { Rect } from "../../geometry.types";
import { caretRect, selectionRects } from "../rich/rich-caret";
import type { RichTextLayout } from "../rich/rich-text.types";

/** Caret width on screen, in CSS pixels. */
const CARET_PX = 1.5;

/**
 * What the rich editor puts over the canvas, in the edited element's frame (placed with
 * `place`): the selection's highlight, a blinking caret and a hidden textarea at the caret that
 * takes typing, IME composition and the clipboard. The canvas draws the text itself.
 */
export class RichEditorOverlay {
  readonly root = document.createElement("div");
  readonly textarea = document.createElement("textarea");
  private readonly highlight = document.createElement("div");
  private readonly caret = document.createElement("div");
  private blink: Animation | null = null;

  constructor(container: HTMLElement, label: string) {
    Object.assign(this.root.style, {
      position: "absolute",
      left: "0",
      top: "0",
      transformOrigin: "0 0",
      cursor: "text",
      zIndex: "1",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.dataset.canvasTextEditor = "";
    Object.assign(this.highlight.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
    });
    Object.assign(this.caret.style, {
      position: "absolute",
      pointerEvents: "none",
      background: "var(--canvas-selection)",
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.textarea.style, {
      position: "absolute",
      width: "1px",
      padding: "0",
      margin: "0",
      border: "0",
      outline: "none",
      resize: "none",
      overflow: "hidden",
      whiteSpace: "pre",
      opacity: "0",
      background: "transparent",
      color: "transparent",
      caretColor: "transparent",
    } satisfies Partial<CSSStyleDeclaration>);
    this.textarea.spellcheck = false;
    this.textarea.setAttribute("aria-label", label);
    this.textarea.dataset.canvasTextEditor = "";
    this.root.append(this.highlight, this.caret, this.textarea);
    container.appendChild(this.root);
  }

  /** Lays the overlay on the element: its size, and the transform to its place on screen. */
  place(transform: string, w: number, h: number): void {
    this.root.style.transform = transform;
    this.root.style.width = `${Math.max(1, w)}px`;
    this.root.style.height = `${Math.max(1, h)}px`;
  }

  /** Draws the selection `start`–`end` with the caret at `focus`, at the camera's `zoom`. */
  show(layout: RichTextLayout, start: number, end: number, focus: number, zoom: number): void {
    const rects = selectionRects(layout, start, end);
    this.highlight.replaceChildren(...rects.map(highlightRect));
    const caret = caretRect(layout, focus);
    const width = CARET_PX / Math.max(zoom, 0.01);
    Object.assign(this.caret.style, {
      left: `${caret.x - width / 2}px`,
      top: `${caret.y}px`,
      width: `${width}px`,
      height: `${caret.h}px`,
      visibility: start === end ? "visible" : "hidden",
    });
    // The textarea follows the caret, so IME candidates show next to it.
    Object.assign(this.textarea.style, {
      left: `${caret.x}px`,
      top: `${caret.y}px`,
      height: `${Math.max(1, caret.h)}px`,
      fontSize: `${Math.max(1, caret.h * 0.8)}px`,
    });
    this.restartBlink();
  }

  destroy(): void {
    this.blink?.cancel();
    this.root.remove();
  }

  private restartBlink(): void {
    this.blink?.cancel();
    this.blink =
      this.caret.animate?.([{ opacity: 1 }, { opacity: 0 }], {
        duration: 1060,
        delay: 500,
        iterations: Infinity,
        easing: "steps(2, jump-none)",
      }) ?? null;
  }
}

function highlightRect({ x, y, w, h }: Rect): HTMLDivElement {
  const div = document.createElement("div");
  Object.assign(div.style, {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    background: "color-mix(in oklab, var(--canvas-selection) 30%, transparent)",
  } satisfies Partial<CSSStyleDeclaration>);
  return div;
}
