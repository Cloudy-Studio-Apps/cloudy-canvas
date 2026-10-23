import { isModKey } from "@shared/core";

import type { CanvasElement, ElementPatch, RichTextSpec, TextStyleShortcut } from "../../elements";
import type { Point } from "../../geometry.types";
import { toUnrotated } from "../../rotation";
import { Disposables } from "../../utils";
import { caretRect, indexAt, indexOnLine, lineIndexAt } from "../rich/rich-caret";
import type { RichTextLayout } from "../rich/rich-text.types";
import { runsForText, runStyleAt, styleRuns, textChange } from "../rich/text-runs";
import type { TextRun } from "../rich/text-run.types";
import { RichEditorOverlay } from "./rich-editor-overlay";
import type { RichSessionHost, RichSnapshot } from "./rich-editor.types";
import { pointerSelect } from "./pointer-select";
import { SessionHistory } from "./session-history";
import { styleShortcutOf } from "./style-shortcut";
import { anchorOf, focusOf, selectBetween } from "./textarea-selection";

type Direction = RichSnapshot["direction"];

/**
 * Editing one element's rich text (`ElementText.rich`): typing goes to a hidden textarea whose
 * value is the text, so caret indexes are the text's; the canvas draws the element as edited,
 * and the caret and selection are drawn from the same layout. Runs follow every change, styles
 * apply to the selection (or to what's typed next), and the session keeps its own undo.
 */
export class RichTextSession<E extends CanvasElement> {
  private text: string;
  private runs: TextRun<object>[];
  private readonly overlay: RichEditorOverlay;
  private readonly history = new SessionHistory();
  private readonly listeners = new Disposables();
  /** The style the next typed text takes (a style set with only a caret). */
  private pending: object | null = null;
  /** Where Up and Down aim, kept while they're pressed in a row. */
  private goalX: number | null = null;
  private cached: { key: string; layout: RichTextLayout } | null = null;

  constructor(
    private readonly host: RichSessionHost,
    readonly id: string,
    private readonly spec: RichTextSpec<E>,
    el: E,
    text: string,
    readonly draft: E | null,
    label: string,
  ) {
    this.text = text;
    this.runs = [...spec.runs(el)];
    this.overlay = new RichEditorOverlay(host.container, label);
    const { textarea, root } = this.overlay;
    textarea.value = this.text;
    this.listeners.listen(textarea, "beforeinput", (e) => this.beforeInput(e as InputEvent));
    this.listeners.listen(textarea, "input", () => this.onInput());
    this.listeners.listen(textarea, "keydown", (e) => this.onKeyDown(e as KeyboardEvent));
    this.listeners.listen(textarea, "select", () => this.sync());
    this.listeners.listen(textarea, "blur", (e) => this.onBlur(e as FocusEvent));
    this.listeners.listen(root, "pointerdown", (e) => this.onPointerDown(e as PointerEvent));
    this.sync();
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(this.text.length, this.text.length);
      this.sync();
    });
  }

  /** The element with what was typed (its size following), and the patch that writes it. */
  result(): { el: E; text: string; patch: ElementPatch<E> | null } | null {
    const el = this.element();
    if (!el) return null;
    return { el, text: this.text, patch: this.spec.apply(el, this.text, this.runs) };
  }

  /** The selection as the textarea has it. */
  selection(): { start: number; end: number } {
    const { selectionStart, selectionEnd } = this.overlay.textarea;
    return { start: selectionStart, end: selectionEnd };
  }

  /** The text and runs as edited so far. */
  content(): { text: string; runs: readonly TextRun<object>[] } {
    return { text: this.text, runs: this.runs };
  }

  /**
   * Sets `patch` over the selection, one undo step, or, with only a caret, on what's typed next
   * (`undefined` fields clear the runs' own values).
   */
  applyStyle(patch: object): void {
    const { start, end } = this.selection();
    if (start === end) {
      this.pending = { ...(this.pending ?? {}), ...patch };
      return;
    }
    this.history.record(this.snapshot(), false);
    this.runs = styleRuns(this.runs, start, end, patch, this.text.length);
    this.sync();
  }

  /** Keeps the overlay (caret and selection too) on the element while the camera moves. */
  reposition(): void {
    const el = this.edited();
    const layout = this.layout();
    if (!el || !layout) return;
    const turn = this.host.turnOf(el);
    const { x, y } = this.host.camera.worldToScreen({ x: el.x, y: el.y });
    const rotate = turn ? ` rotate(${-turn}deg)` : "";
    // A mirrored text is edited mirrored, as it's drawn.
    const mirror = el.mirrored ? ` translate(${el.w}px, 0) scaleX(-1)` : "";
    this.overlay.place(
      `translate(${x}px, ${y}px)${rotate} scale(${this.host.camera.zoom})${mirror}`,
      el.w,
      el.h,
    );
    const { textarea } = this.overlay;
    const { start, end } = this.selection();
    const focus = focusOf(textarea);
    this.overlay.show(layout, start, end, focus, this.host.camera.zoom);
  }

  /** Removes the overlay (the caller writes the result first). */
  destroy(): void {
    this.listeners.dispose();
    this.overlay.destroy();
    this.host.preview(null, this.draft !== null);
    this.host.onSelection(null);
  }

  private element(): E | undefined {
    return this.draft ?? (this.host.getElement(this.id) as E | undefined);
  }

  /** The element as edited: its text, runs and the size they give it. */
  private edited(): E | undefined {
    const el = this.element();
    if (!el) return undefined;
    const patch = this.spec.apply(el, this.text, this.runs);
    return patch ? ({ ...el, ...patch } as E) : el;
  }

  private layout(): RichTextLayout | null {
    const el = this.edited();
    if (!el) return null;
    const key = `${this.text}|${JSON.stringify(this.runs)}|${el.w}|${el.h}`;
    if (this.cached?.key !== key) {
      this.cached = { key, layout: this.spec.layout(el, this.text, this.runs) };
    }
    return this.cached.layout;
  }

  /** Draws the element as edited, the caret and the selection, and reports the selection. */
  private sync(): void {
    const el = this.edited();
    if (!el) return;
    this.host.preview(el, this.draft !== null);
    this.reposition();
    const { start, end } = this.selection();
    this.host.onSelection({ id: this.id, start, end });
  }

  private snapshot(): RichSnapshot {
    const { textarea } = this.overlay;
    return {
      text: this.text,
      runs: this.runs,
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      direction: textarea.selectionDirection as Direction,
    };
  }

  private restore(state: RichSnapshot): void {
    this.text = state.text;
    this.runs = [...state.runs];
    const { textarea } = this.overlay;
    textarea.value = state.text;
    textarea.setSelectionRange(state.start, state.end, state.direction);
    this.pending = null;
    this.sync();
  }

  private beforeInput(event: InputEvent): void {
    const typing = event.inputType.startsWith("insert") || event.inputType.startsWith("delete");
    this.history.record(this.snapshot(), typing && event.inputType !== "insertFromPaste");
  }

  private onInput(): void {
    const next = this.overlay.textarea.value;
    const { at, inserted } = textChange(this.text, next);
    this.runs = runsForText(this.runs, this.text, next);
    if (this.pending && inserted > 0) {
      this.runs = styleRuns(this.runs, at, at + inserted, this.pending, next.length);
    }
    this.text = next;
    this.goalX = null;
    this.sync();
  }

  private onBlur(event: FocusEvent): void {
    // Focus moving to the app's controls (a panel field restyling the selection) keeps editing.
    const to = event.relatedTarget;
    if (to instanceof Node && !this.host.container.contains(to)) return;
    this.host.commit();
  }

  private onKeyDown(event: KeyboardEvent): void {
    // Keep canvas shortcuts (Delete, V, H, …) from firing while typing.
    event.stopPropagation();
    const mod = isModKey(event);
    const key = event.key.toLowerCase();
    if (event.key === "Escape" || (event.key === "Enter" && mod)) {
      event.preventDefault();
      this.host.commit();
      return;
    }
    if (mod && (key === "z" || key === "y")) {
      event.preventDefault();
      const redo = key === "y" || event.shiftKey;
      const state = redo ? this.history.redo(this.snapshot()) : this.history.undo(this.snapshot());
      if (state) this.restore(state);
      return;
    }
    const shortcut = styleShortcutOf(event);
    if (shortcut) {
      event.preventDefault();
      this.toggle(shortcut);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (event.altKey || mod) return;
      event.preventDefault();
      this.moveVertically(event.key === "ArrowUp" ? -1 : 1, event.shiftKey);
      return;
    }
    if ((event.key === "Home" || event.key === "End") && !mod) {
      event.preventDefault();
      this.moveToLineEdge(event.key === "End", event.shiftKey);
      return;
    }
    this.goalX = null;
    if (event.key.startsWith("Arrow")) this.pending = null;
    requestAnimationFrame(() => this.sync());
  }

  private toggle(shortcut: TextStyleShortcut): void {
    const el = this.element();
    const { start, end } = this.selection();
    if (!el || !this.spec.shortcut) return;
    const at = {
      ...runStyleAt(this.runs, start === end ? Math.max(0, start - 1) : start),
      ...(this.pending ?? {}),
    };
    const patch = this.spec.shortcut(el, shortcut, at);
    if (patch) this.applyStyle(patch);
  }

  /** Moves the caret a line up or down, keeping its x (`extend`: the selection grows). */
  private moveVertically(step: -1 | 1, extend: boolean): void {
    const layout = this.layout();
    if (!layout) return;
    const { textarea } = this.overlay;
    const focus = focusOf(textarea);
    const lineIndex = lineIndexAt(layout, focus);
    this.goalX ??= caretRect(layout, focus).x;
    const target = layout.lines[lineIndex + step];
    const index = target
      ? indexOnLine(layout, target, this.goalX)
      : step < 0
        ? 0
        : this.text.length;
    this.moveFocus(index, extend);
  }

  private moveToLineEdge(end: boolean, extend: boolean): void {
    const layout = this.layout();
    if (!layout) return;
    const { textarea } = this.overlay;
    const focus = focusOf(textarea);
    const line = layout.lines[lineIndexAt(layout, focus)];
    if (!line) return;
    const next = layout.lines[layout.lines.indexOf(line) + 1];
    // A wrapped line ends before its hanging spaces' last one, so the caret stays on it.
    const lineEnd = next && next.start === line.end ? line.end - 1 : line.end;
    this.goalX = null;
    this.moveFocus(end ? lineEnd : line.start, extend);
  }

  /** Puts the caret at `index`, or, extending, moves the selection's free end there. */
  private moveFocus(index: number, extend: boolean): void {
    const { textarea } = this.overlay;
    this.pending = null;
    if (extend) selectBetween(textarea, anchorOf(textarea), index);
    else textarea.setSelectionRange(index, index);
    this.sync();
  }

  private onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const { textarea, root } = this.overlay;
    textarea.focus();
    this.pending = null;
    this.goalX = null;
    pointerSelect(event, {
      textarea,
      root,
      text: this.text,
      indexAt: (e) => {
        const layout = this.layout();
        return layout ? indexAt(layout, this.localPoint(e)) : null;
      },
      changed: () => this.sync(),
      listeners: this.listeners,
    });
  }

  /** A pointer event's place in the element's own frame (from its top-left corner, unturned). */
  private localPoint(event: PointerEvent): Point {
    const el = this.edited();
    if (!el) return { x: 0, y: 0 };
    const box = this.host.container.getBoundingClientRect();
    const world = this.host.camera.screenToWorld({
      x: event.clientX - box.left,
      y: event.clientY - box.top,
    });
    const local = toUnrotated(world, { ...el, rotation: this.host.turnOf(el) });
    return { x: local.x - el.x, y: local.y - el.y };
  }
}
