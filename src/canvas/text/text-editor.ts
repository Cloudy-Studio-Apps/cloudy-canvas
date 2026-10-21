import { isModKey } from "@shared/core";

import type { Camera } from "../camera";
import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds, ElementText } from "../elements";
import type { Rect } from "../geometry.types";
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

  /**
   * Edits an element's text, or one text `part` of it (e.g. a table cell; the kind's first part
   * when none is given). Does nothing for elements without text.
   */
  start(id: string, part?: string | null): void {
    const el = this.hooks.getElement(id);
    const text = el ? this.kinds.kindOf(el).text : null;
    if (el && text)
      this.open(el, text, null, text.firstPart?.(el, part ?? undefined) ?? part ?? null);
  }

  /** Types the text of a new element, which is added to the document on commit. */
  startDraft(el: CanvasElement): void {
    const text = this.kinds.kindOf(el).text;
    if (text) this.open(el, text, el, null);
  }

  /** Keeps the editor aligned with the element while the camera moves. */
  reposition(): void {
    const session = this.session;
    if (!session) return;
    const el = this.elementOf(session);
    const text = el ? this.kinds.kindOf(el).text : null;
    if (!el || !text) return this.discard();
    const box = partBox(el, text, session.part);
    const { x, y } = this.camera.worldToScreen({ x: el.x + box.x, y: el.y + box.y });
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
    const patch = text.set(el, value, session.part ?? undefined);
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

  private open<E extends CanvasElement>(
    el: E,
    text: ElementText<E>,
    draft: E | null,
    part: string | null,
  ): void {
    this.commit();
    const at = part ?? undefined;
    const box = partBox(el, text, part);
    const textarea = document.createElement("textarea");
    textarea.value = text.get(el, at);
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", `${this.kinds.kindOf(el).label} text`);
    textarea.dataset.canvasTextEditor = "";
    Object.assign(textarea.style, textEditorStyle(text.style(el, at), box, !text.fitContent));

    const listeners = new Disposables();
    listeners.listen(textarea, "input", () => this.resizeToContent());
    listeners.listen(textarea, "keydown", this.handleKeyDown);
    listeners.listen(textarea, "blur", () => this.commit());
    this.container.appendChild(textarea);
    this.session = { textarea, id: el.id, part, draft, listeners };

    this.resizeToContent();
    this.reposition();
    this.hooks.onStart(el.id, part);
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
    const style = text.style(el, session.part ?? undefined);
    if (text.fitContent) fitToContent(session.textarea, style.fontSize);
    else if (style.vAlign === "middle")
      centerVertically(session.textarea, partBox(el, text, session.part).h);
  }

  /** The element being edited: the draft, or the element as the scene sees it. */
  private elementOf(session: Session): CanvasElement | undefined {
    return session.draft ?? this.hooks.getElement(session.id);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Keep canvas shortcuts (Delete, V, H, …) from firing while typing.
    event.stopPropagation();
    if (event.key === "Tab" && this.moveToNextPart(event.shiftKey)) {
      event.preventDefault();
      return;
    }
    if (
      event.key === "Escape" ||
      (event.key === "Enter" && (isModKey(event) || (this.singleLine() && !event.shiftKey)))
    ) {
      event.preventDefault();
      this.commit();
    }
  };

  private singleLine(): boolean {
    const session = this.session;
    const el = session ? this.elementOf(session) : undefined;
    const text = el ? this.kinds.kindOf(el).text : null;
    return el && text ? (text.style(el, session?.part ?? undefined).singleLine ?? false) : false;
  }

  /** Commits and edits the next (or previous) part. Returns `false` when there's none. */
  private moveToNextPart(back: boolean): boolean {
    const session = this.session;
    if (!session?.part || session.draft) return false;
    const el = this.elementOf(session);
    const next = el ? this.kinds.kindOf(el).text?.nextPart?.(el, session.part, back) : null;
    if (!next) return false;
    const id = session.id;
    this.commit();
    this.start(id, next);
    return true;
  }
}

/** The box the editor covers for a part, relative to the element (the whole element by default). */
function partBox<E extends CanvasElement>(el: E, text: ElementText<E>, part: string | null): Rect {
  if (part && text.partBox) return text.partBox(el, part);
  return { x: 0, y: 0, w: el.w, h: el.h };
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
