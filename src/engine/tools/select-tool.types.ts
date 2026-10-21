import type { Shape } from "../document";
import type { ConnectGesture } from "./connect-gesture";
import type { ConnectorDrag } from "./connector-drag";
import type { ResizeGesture } from "./resize-gesture";
import type { CanvasPointer } from "./tool.types";

export type Gesture =
  | {
      kind: "move";
      start: CanvasPointer;
      /** Each moved shape as it was when the drag started. */
      origins: Map<string, Shape>;
      started: boolean;
      /** Shift-click on an already selected shape deselects it — unless it turns into a drag. */
      toggleOnClick: string | null;
    }
  | { kind: "marquee"; start: CanvasPointer; base: Set<string> }
  /** Dragging a relation out of a database column handle. */
  | { kind: "connect"; connect: ConnectGesture }
  | { kind: "resize"; resize: ResizeGesture }
  /** Moving a connector end, or drawing a connector out of a quick-connect dot. */
  | { kind: "connector"; drag: ConnectorDrag };
