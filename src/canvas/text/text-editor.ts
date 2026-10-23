import { isModKey } from "@shared/core";

import type { Camera } from "../camera";
import { rotatePoint } from "../rotation";
import type { CanvasDocument } from "../document";
import type {
  CanvasElement,
  ElementKinds,
  ElementText,
  RichTextSpec,
  TextSizing,
} from "../elements";
import type { Rect } from "../geometry.types";
import { Disposables } from "../utils";
import { textEditorStyle } from "./text-editor-style";
import { textFont } from "./text-font";
import type { TextFont } from "./text-font.types";
import { measureTextBlock } from "./text-metrics";
import type { TextEditorHooks, Session } from "./text-editor.types";
import type { TextSelection } from "./rich-editor/rich-editor.types";
import { RichTextSession } from "./rich-editor/rich-text-session";
import type { TextRun } from "./rich/text-run.types";

/**
 * Plain DOM <textarea> laid over the canvas while editing an element's text. Works for any element
 * whose kind has a `text` spec; a rich text (`ElementText.rich`) is edited by a `RichTextSession`
 * instead. Framework-free so the web version and any host can reuse it.
 */
export class TextEditor {
  private session: Session | null = null;
  private rich: RichTextSession<CanvasElement> | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly doc: CanvasDocument,
    private readonly kinds: ElementKinds,
    private readonly camera: Camera,
    private readonly hooks: TextEditorHooks,
  ) {}

  get editingId(): string | null {
    return this.rich?.id ?? this.session?.id ?? null;
  }

  /** The rich text being edited: its text and runs so far, and the selection. */
  richContent(): (TextSelection & { text: string; runs: readonly TextRun<object>[] }) | null {
    const rich = this.rich;
    if (!rich) return null;
    return { id: rich.id, ...rich.content(), ...rich.selection() };
  }

  /** Styles the selection of the rich text being edited (see `RichTextSession.applyStyle`). */
  applyRichStyle(patch: object): boolean {
    if (!this.rich) return false;
    this.rich.applyStyle(patch);
    return true;
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
    this.rich?.reposition();
    const session = this.session;
    if (!session) return;
    const el = this.elementOf(session);
    const text = el ? this.kinds.kindOf(el).text : null;
    if (!el || !text) return this.discard();
    const box = partBox(el, text, session.part);
    // A turned element's text turns with it, round its corner.
    const turn = this.kinds.kindOf(el).rotatable ? (el.rotation ?? 0) : 0;
    const corner = rotatePoint({ x: el.x + box.x, y: el.y + box.y }, el, turn);
    const { x, y } = this.camera.worldToScreen(corner);
    const rotate = turn ? ` rotate(${-turn}deg)` : "";
    session.textarea.style.transform = `translate(${x}px, ${y}px)${rotate} scale(${this.camera.zoom})`;
  }

  commit(): void {
    if (this.rich) return this.commitRich();
    const session = this.close();
    if (!session) return;
    const el = this.elementOf(session);
    const text = el ? this.kinds.kindOf(el).text : null;
    this.hooks.onEnd(session.id);
    if (!el || !text) return;
    const value = session.textarea.value;
    this.write(el, value, text.removeWhenEmpty ?? false, session.draft !== null, () =>
      text.set(el, value, session.part ?? undefined),
    );
  }

  destroy(): void {
    this.close();
    this.rich?.destroy();
    this.rich = null;
  }

  private commitRich(): void {
    const rich = this.rich;
    if (!rich) return;
    this.rich = null;
    const result = rich.result();
    rich.destroy();
    this.hooks.onEnd(rich.id);
    if (!result) return;
    const removeWhenEmpty = this.kinds.kindOf(result.el).text?.removeWhenEmpty ?? false;
    this.write(result.el, result.text, removeWhenEmpty, rich.draft !== null, () => result.patch);
  }

  /** Writes edited text: removes an emptied element, adds a typed draft or updates the element. */
  private write(
    el: CanvasElement,
    value: string,
    removeWhenEmpty: boolean,
    draft: boolean,
    patchOf: () => Partial<CanvasElement> | null,
  ): void {
    if (removeWhenEmpty && value.trim() === "") {
      if (!draft) this.hooks.remove(el.id);
      return;
    }
    const patch = patchOf();
    if (draft) {
      this.doc.checkpoint();
      this.doc.add({ ...el, ...patch, index: this.doc.nextIndex() });
      this.hooks.onCreate(el.id);
    } else if (patch) {
      this.doc.checkpoint();
      this.doc.update(el.id, patch);
    }
  }

  private open<E extends CanvasElement>(
    el: E,
    text: ElementText<E>,
    draft: E | null,
    part: string | null,
  ): void {
    this.commit();
    const at = part ?? undefined;
    if (text.rich) {
      this.rich = new RichTextSession(
        {
          container: this.container,
          camera: this.camera,
          getElement: (id) => this.hooks.getElement(id),
          turnOf: (target) => (this.kinds.kindOf(target).rotatable ? (target.rotation ?? 0) : 0),
          preview: (edited, isDraft) => this.hooks.preview(edited, isDraft),
          onSelection: (selection) => this.hooks.onSelection(selection),
          commit: () => this.commit(),
        },
        el.id,
        text.rich as RichTextSpec<CanvasElement>,
        el,
        text.get(el, at),
        draft,
        `${this.kinds.kindOf(el).label} text`,
      );
      this.hooks.onStart(el.id, part, true);
      return;
    }
    const box = partBox(el, text, part);
    const textarea = document.createElement("textarea");
    textarea.value = text.get(el, at);
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", `${this.kinds.kindOf(el).label} text`);
    textarea.dataset.canvasTextEditor = "";
    Object.assign(
      textarea.style,
      textEditorStyle(text.style(el, at), box, sizingOf(text, el) !== "content"),
    );

    const listeners = new Disposables();
    listeners.listen(textarea, "input", () => this.resizeToContent());
    listeners.listen(textarea, "keydown", this.handleKeyDown);
    listeners.listen(textarea, "blur", () => this.commit());
    this.container.appendChild(textarea);
    this.session = { textarea, id: el.id, part, draft, listeners };

    this.resizeToContent();
    this.reposition();
    this.hooks.onStart(el.id, part, false);
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
   * Text sized to its element grows with what's typed (both ways, or only down with
   * `fitHeight`); text centered or at the bottom of its element keeps its wrapped block there.
   */
  private resizeToContent(): void {
    const session = this.session;
    const el = session ? this.elementOf(session) : undefined;
    const text = el ? this.kinds.kindOf(el).text : null;
    if (!session || !el || !text) return;
    const style = text.style(el, session.part ?? undefined);
    const sizing = sizingOf(text, el);
    if (sizing === "content") fitToContent(session.textarea, textFont(style.fontSize, style));
    else if (sizing === "height") fitHeight(session.textarea);
    else if (style.vAlign !== "top")
      alignVertically(session.textarea, partBox(el, text, session.part).h, style.vAlign);
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

/** Pads the top of the textarea so its (wrapped) text sits in the middle or at the bottom. */
function alignVertically(
  textarea: HTMLTextAreaElement,
  height: number,
  vAlign: "middle" | "bottom",
): void {
  textarea.style.paddingTop = "0";
  textarea.style.height = "auto";
  const free = Math.max(0, height - textarea.scrollHeight);
  textarea.style.paddingTop = `${vAlign === "middle" ? free / 2 : free}px`;
  textarea.style.height = `${height}px`;
}

/** Grows the textarea down to its wrapped text (its width stays). */
function fitHeight(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

/** Sizes the textarea to its unwrapped text, with room for the caret. */
function fitToContent(textarea: HTMLTextAreaElement, font: TextFont): void {
  const size = measureTextBlock(textarea.value || " ", font);
  textarea.style.width = `${size.w + font.size}px`;
  textarea.style.height = `${size.h}px`;
}

/** How the edited element sizes to its text (see `ElementText.sizing`). */
function sizingOf<E extends CanvasElement>(text: ElementText<E>, el: E): TextSizing {
  if (text.sizing) return text.sizing(el);
  return text.fitContent ? "content" : text.fitHeight ? "height" : "fixed";
}
