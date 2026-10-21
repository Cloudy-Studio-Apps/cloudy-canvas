import { isModKey } from "@shared/core";

import type { Camera } from "../camera";
import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds, ElementText } from "../elements";
import { Disposables } from "../utils";
import { textEditorStyle } from "./text-editor-style";
import { measureText } from "./text-metrics";
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
    if (el && text) this.open(el, text, null);
  }

  /** Types the text of a new element, which is added to the document on commit. */
  startDraft(el: CanvasElement): void {
    const text = this.kinds.kindOf(el).text;
    if (text) this.open(el, text, el);
  }

  /** Keeps the editor aligned with the element while the camera moves. */
  reposition(): void {
    const session = this.session;
    if (!session) return;
    const el = this.elementOf(session);
    if (!el || !this.kinds.kindOf(el).text) return this.discard();
    const { x, y } = this.camera.worldToScreen(el);
    session.textarea.style.transform = `translate(${x}px, ${y}px) scale(${this.camera.zoom})`;
  }

  commit(): void {
    const session = this.close();
    if (!session) return;
    const el = this.elementOf(session);
    const text = el ? this.kinds.kindOf(el).text : null;
    this.hooks.onEnd(session.id);
    if (!el || !text) return;
    const value = session.textarea.value;
    if (text.removeWhenEmpty && value.trim() === "") {
      if (!session.draft) this.hooks.remove(el.id);
      return;
    }
    const patch = text.set(el, value);
    if (session.draft) {
      this.doc.checkpoint();
      this.doc.add({ ...el, ...patch, index: this.doc.nextIndex() });
      this.hooks.onCreate(el.id);
    } else if (patch) {
      this.doc.update(el.id, patch);
    }
  }

  destroy(): void {
    this.close();
  }

  private open<E extends CanvasElement>(el: E, text: ElementText<E>, draft: E | null): void {
    this.commit();
    const textarea = document.createElement("textarea");
    textarea.value = text.get(el);
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", `${this.kinds.kindOf(el).label} text`);
    textarea.dataset.canvasTextEditor = "";
    Object.assign(textarea.style, textEditorStyle(text.style(el), el, !text.fitContent));

    const listeners = new Disposables();
    listeners.listen(textarea, "input", () => this.resizeToContent());
    listeners.listen(textarea, "keydown", this.handleKeyDown);
    listeners.listen(textarea, "blur", () => this.commit());
    this.container.appendChild(textarea);
    this.session = { textarea, id: el.id, draft, listeners };

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

  /**
   * Text sized to its element grows with what's typed; text centered in its element keeps its
   * wrapped block in the middle.
   */
  private resizeToContent(): void {
    const session = this.session;
    const el = session ? this.elementOf(session) : undefined;
    const text = el ? this.kinds.kindOf(el).text : null;
    if (!session || !el || !text) return;
    const style = text.style(el);
    if (text.fitContent) fitToContent(session.textarea, style.fontSize);
    else if (style.vAlign === "middle") centerVertically(session.textarea, el.h);
  }

  /** The element being edited: the draft, or the element as the scene sees it. */
  private elementOf(session: Session): CanvasElement | undefined {
    return session.draft ?? this.hooks.getElement(session.id);
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
    const el = this.session ? this.elementOf(this.session) : undefined;
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

/** Sizes the textarea to its unwrapped text, with room for the caret. */
function fitToContent(textarea: HTMLTextAreaElement, fontSize: number): void {
  const size = measureText(textarea.value || " ", fontSize);
  textarea.style.width = `${size.w + fontSize}px`;
  textarea.style.height = `${size.h}px`;
}
