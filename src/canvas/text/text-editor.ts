import { isModKey } from "@shared/core";

import type { Camera } from "../camera";
import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds, ElementText } from "../elements";
import { Disposables } from "../utils";
import { textEditorStyle } from "./text-editor-style";
import type { TextEditorHooks, Session } from "./text-editor.types";

/**
 * Plain DOM <textarea> laid over the canvas while editing an element's text. Works for any element
 * whose kind has a `text` spec. Framework-free so the web version and any host can reuse it.
 */
export class TextEditor {
  private session: Session | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly doc: CanvasDocument,
    private readonly kinds: ElementKinds,
    private readonly camera: Camera,
    private readonly hooks: TextEditorHooks,
  ) {}

  get editingId(): string | null {
    return this.session?.id ?? null;
  }

  /** Edits an element's text. Does nothing for elements without text. */
  start(id: string): void {
    const el = this.hooks.getElement(id);
    const text = el ? this.kinds.kindOf(el).text : null;
    if (el && text) this.open(el, text, `${this.kinds.kindOf(el).label} text`);
  }

  /** Keeps the editor aligned with the element while the camera moves. */
  reposition(): void {
    const session = this.session;
    if (!session) return;
    const el = this.hooks.getElement(session.id);
    if (!el || !this.kinds.kindOf(el).text) return this.discard();
    const { x, y } = this.camera.worldToScreen(el);
    session.textarea.style.transform = `translate(${x}px, ${y}px) scale(${this.camera.zoom})`;
  }

  commit(): void {
    const session = this.close();
    if (!session) return;
    const el = this.hooks.getElement(session.id);
    const patch = el ? this.kinds.kindOf(el).text?.set(el, session.textarea.value) : null;
    if (patch) this.doc.update(session.id, patch);
    this.hooks.onEnd(session.id);
  }

  destroy(): void {
    this.close();
  }

  private open<E extends CanvasElement>(el: E, text: ElementText<E>, ariaLabel: string): void {
    this.commit();
    const textarea = document.createElement("textarea");
    textarea.value = text.get(el);
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", ariaLabel);
    textarea.dataset.canvasTextEditor = "";
    Object.assign(textarea.style, textEditorStyle(text.style(el), el));

    const listeners = new Disposables();
    listeners.listen(textarea, "input", () => this.resizeToContent());
    listeners.listen(textarea, "keydown", this.handleKeyDown);
    listeners.listen(textarea, "blur", () => this.commit());
    this.container.appendChild(textarea);
    this.session = { textarea, id: el.id, listeners };

    this.resizeToContent();
    this.reposition();
    this.hooks.onStart(el.id);
    // Wait a frame so the pointerdown that started editing doesn't steal focus back.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
  }

  private discard(): void {
    const session = this.close();
    if (session) this.hooks.onEnd(session.id);
  }

  /** Removes the textarea and returns the session it belonged to. */
  private close(): Session | null {
    const session = this.session;
    this.session = null;
    if (!session) return null;
    session.listeners.dispose();
    session.textarea.remove();
    return session;
  }

  /** Text centered in its element keeps its wrapped block in the middle while typing. */
  private resizeToContent(): void {
    const session = this.session;
    const el = session ? this.hooks.getElement(session.id) : undefined;
    const text = el ? this.kinds.kindOf(el).text : null;
    if (!session || !el || text?.style(el).vAlign !== "middle") return;
    centerVertically(session.textarea, el.h);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Keep canvas shortcuts (Delete, V, H, …) from firing while typing.
    event.stopPropagation();
    if (
      event.key === "Escape" ||
      (event.key === "Enter" && (isModKey(event) || (this.singleLine() && !event.shiftKey)))
    ) {
      event.preventDefault();
      this.commit();
    }
  };

  private singleLine(): boolean {
    const el = this.session ? this.hooks.getElement(this.session.id) : undefined;
    return el ? (this.kinds.kindOf(el).text?.style(el).singleLine ?? false) : false;
  }
}

/** Pads the top of the textarea so its (wrapped) text sits in the middle, like on canvas. */
function centerVertically(textarea: HTMLTextAreaElement, height: number): void {
  textarea.style.paddingTop = "0";
  textarea.style.height = "auto";
  const content = textarea.scrollHeight;
  textarea.style.paddingTop = `${Math.max(0, (height - content) / 2)}px`;
  textarea.style.height = `${height}px`;
}
