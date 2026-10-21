import type { Point } from "../geometry.types";
import type { CanvasPointer } from "./tool.types";

export type Gesture =
  | {
      kind: "move";
      start: CanvasPointer;
      origins: Map<string, Point>;
      started: boolean;
      /** Shift-click on an already selected shape deselects it — unless it turns into a drag. */
      toggleOnClick: string | null;
    }
  | { kind: "marquee"; start: CanvasPointer; base: Set<string> };
