import { isModKey } from "@core";

import type { Camera } from "../camera";
import type { BoardDocument, EditableShape, TextShape } from "../document";
import { isEditableShape } from "../document";
import { Disposables } from "../utils";
import { commitTextEdit } from "./commit-text-edit";
import { textEditorStyle } from "./text-editor-style";
import { measureText } from "./text-metrics";

export interface TextEditorHooks {
  onStart(id: string): void;
  onEnd(id: string): void;
  /** A draft (new) shape was committed with content and added to the document. */
  onCreate(id: string): void;
}

interface Session {
  textarea: HTMLTextAreaElement;
  shape: EditableShape;
  /** New text that isn't in the document yet; only added on commit if non-empty (keeps undo clean). */
  isDraft: boolean;
  listeners: Disposables;
}

/**
 * Plain DOM <textarea> laid over the canvas while editing a sticky or text shape.
 * Framework-free so the web version and any host can reuse it.
 */
export class TextEditor {
  private session: Session | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly doc: BoardDocument,
    private readonly camera: Camera,
    private readonly hooks: TextEditorHooks,
  ) {}

  get editingId(): string | null {
    return this.session?.shape.id ?? null;
  }

  /** Edits an existing sticky or text shape. */
  start(id: string): void {
    const shape = this.doc.get(id);
    if (isEditableShape(shape)) this.open(shape, false);
  }

  /** Types a new text shape that is added to the document on commit. */
  startDraft(shape: TextShape): void {
    this.open(shape, true);
  }

  /** Keeps the editor aligned with the shape while the camera moves. */
  reposition(): void {
    const session = this.session;
    if (!session) return;
    const live = session.isDraft ? session.shape : this.doc.get(session.shape.id);
    if (!live) return this.discard();
    const { x, y } = this.camera.worldToScreen(live);
    session.textarea.style.transform = `translate(${x}px, ${y}px) scale(${this.camera.zoom})`;
  }

  commit(): void {
    const session = this.close();
    if (!session) return;
    const { shape, isDraft, textarea } = session;
    const created = commitTextEdit(this.doc, { shape, isDraft, text: textarea.value });
    this.hooks.onEnd(shape.id);
    if (created) this.hooks.onCreate(shape.id);
  }

  destroy(): void {
    this.close();
  }

  private open(shape: EditableShape, isDraft: boolean): void {
    this.commit();
    const textarea = createTextarea(shape);
    const listeners = new Disposables();
    listeners.listen(textarea, "input", () => this.resizeToContent());
    listeners.listen(textarea, "keydown", this.handleKeyDown);
    listeners.listen(textarea, "blur", () => this.commit());
    this.container.appendChild(textarea);
    this.session = { textarea, shape, isDraft, listeners };

    this.resizeToContent();
    this.reposition();
    this.hooks.onStart(shape.id);
    // Wait a frame so the pointerdown that started editing doesn't steal focus back.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
  }

  private discard(): void {
    const session = this.close();
    if (session) this.hooks.onEnd(session.shape.id);
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

  private resizeToContent(): void {
    const session = this.session;
    if (session?.shape.type !== "text") return;
    const { textarea, shape } = session;
    const size = measureText(textarea.value || " ", shape.fontSize);
    textarea.style.width = `${size.w + shape.fontSize}px`;
    textarea.style.height = `${size.h}px`;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Keep canvas shortcuts (Delete, V, H, …) from firing while typing.
    event.stopPropagation();
    if (event.key === "Escape" || (event.key === "Enter" && isModKey(event))) {
      event.preventDefault();
      this.commit();
    }
  };
}

function createTextarea(shape: EditableShape): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = shape.text;
  textarea.spellcheck = false;
  textarea.setAttribute("aria-label", shape.type === "sticky" ? "Sticky note text" : "Text");
  textarea.dataset.canvasTextEditor = "";
  Object.assign(textarea.style, textEditorStyle(shape));
  return textarea;
}
