import type { AnyElement } from "../elements";
import type { ResizeGesture } from "./resize-gesture";
import type { CanvasPointer } from "./tool.types";

export type Gesture =
  | {
      kind: "move";
      start: CanvasPointer;
      /** Each moved element as it was when the drag started. */
      origins: Map<string, AnyElement>;
      started: boolean;
      /** Shift-click on an already selected element deselects it — unless it turns into a drag. */
      toggleOnClick: string | null;
    }
  | { kind: "marquee"; start: CanvasPointer; base: Set<string> }
  | { kind: "resize"; resize: ResizeGesture };
