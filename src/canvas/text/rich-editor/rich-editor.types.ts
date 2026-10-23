import type { Camera } from "../../camera";
import type { CanvasElement } from "../../elements";
import type { TextRun } from "../rich/text-run.types";

/** The characters selected in the text being edited (`start` = `end`: just the caret). */
export interface TextSelection {
  id: string;
  start: number;
  end: number;
}

/** A moment of a rich editing session, for its undo history. */
export interface RichSnapshot {
  text: string;
  runs: readonly TextRun<object>[];
  start: number;
  end: number;
  direction: "forward" | "backward" | "none";
}

/** What a rich editing session reaches of the engine. */
export interface RichSessionHost {
  container: HTMLElement;
  camera: Camera;
  /** The element as the scene sees it. */
  getElement(id: string): CanvasElement | undefined;
  /** Degrees the element is turned by (0 for kinds that don't turn). */
  turnOf(el: CanvasElement): number;
  /** Draws the element as it's being edited (`null`: as the document has it again). */
  preview(el: CanvasElement | null, draft: boolean): void;
  /** The selection moved (or editing ended: `null`). */
  onSelection(selection: TextSelection | null): void;
  /** Ends the session, writing what was typed. */
  commit(): void;
}
