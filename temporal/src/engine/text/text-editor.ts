import { isModKey } from "@core";

import type { Camera } from "../camera";
import type { BoardDocument, EditableShape, TextShape } from "../document";
import { editableText, isEditableShape, isErNamed } from "../document";
import { Disposables } from "../utils";
import { commitTextEdit } from "./commit-text-edit";
import { editorFontSize, editorOrigin, textEditorStyle } from "./text-editor-style";
import { measureText } from "./text-metrics";
import type { TextEditorHooks, Session } from "./text-editor.types";

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
    if (!isEditableShape(live)) return this.discard();
    const { x, y } = this.camera.worldToScreen(editorOrigin(live));
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
    if (session?.shape.type === "geo") return centerVertically(session.textarea, session.shape.h);
    if (session && isErNamed(session.shape) && session.shape.type !== "er-aggregate") {
      return centerVertically(session.textarea, session.shape.h);
    }
    if (session?.shape.type !== "text" && session?.shape.type !== "section") return;
    const { textarea, shape } = session;
    const fontSize = editorFontSize(shape);
    const size = measureText(textarea.value || " ", fontSize);
    // Sections' titles are bold, a bit wider than the regular-weight measurement.
    textarea.style.width = `${size.w * (shape.type === "section" ? 1.1 : 1) + fontSize}px`;
    textarea.style.height = `${size.h}px`;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Keep canvas shortcuts (Delete, V, H, …) from firing while typing.
    event.stopPropagation();
    // ER names are one line, so plain Enter finishes them.
    const oneLine = this.session ? isErNamed(this.session.shape) : false;
    if (
      event.key === "Escape" ||
      (event.key === "Enter" && (isModKey(event) || (oneLine && !event.shiftKey)))
    ) {
      event.preventDefault();
      this.commit();
    }
  };
}

const TEXTAREA_LABELS: Record<EditableShape["type"], string> = {
  sticky: "Sticky note text",
  text: "Text",
  geo: "Shape text",
  section: "Section title",
  "er-entity": "Entity name",
  "er-relation": "Relation name",
  "er-attribute": "Attribute name",
  "er-aggregate": "Aggregation name",
};

/** Pads the top of a shape's textarea so its (wrapped) text sits in the middle, like on canvas. */
function centerVertically(textarea: HTMLTextAreaElement, height: number): void {
  textarea.style.paddingTop = "0";
  textarea.style.height = "auto";
  const content = textarea.scrollHeight;
  textarea.style.paddingTop = `${Math.max(0, (height - content) / 2)}px`;
  textarea.style.height = `${height}px`;
}

function createTextarea(shape: EditableShape): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = editableText(shape);
  textarea.spellcheck = false;
  textarea.setAttribute("aria-label", TEXTAREA_LABELS[shape.type]);
  textarea.dataset.canvasTextEditor = "";
  Object.assign(textarea.style, textEditorStyle(shape));
  return textarea;
}
