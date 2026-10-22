import type { CanvasElement, ElementGesture } from "../elements";
import type { Rect } from "../geometry.types";
import type { Snapper } from "../snapping";
import type { ResizeGesture } from "./resize-gesture";
import type { CanvasPointer } from "./tool.types";

export type Gesture =
  | {
      kind: "move";
      start: CanvasPointer;
      /** Each moved element as it was when the drag started. */
      origins: Map<string, CanvasElement>;
      started: boolean;
      /** The box round the moved elements when the drag started (what snaps), if any is outlined. */
      box: Rect | null;
      snapper: Snapper | null;
      /** Shift-click on an already selected element deselects it — unless it turns into a drag. */
      toggleOnClick: string | null;
      /**
       * A click (not a drag) on this already selected element selects its part there (a table
       * cell), or extends `partBefore` with Shift or Ctrl/Cmd.
       */
      partOnClick: string | null;
      partBefore: string | null;
    }
  | { kind: "marquee"; start: CanvasPointer; base: Set<string> }
  | { kind: "resize"; resize: ResizeGesture }
  /** A drag started on part of an element its kind offers (e.g. a handle). */
  | { kind: "element"; gesture: ElementGesture };
