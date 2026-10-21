import type { ConnectorShape, ConnectorSide, GeoShape, StickyShape } from "../document";
import type { TableHandle } from "../tools/tool.types";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export type ResizableShape = GeoShape | StickyShape;

/** What a press at a point grabs, before falling back to the shape under it. */
export type Interaction =
  | { kind: "endpoint"; connector: ConnectorShape; which: "start" | "end" }
  | { kind: "resize"; shape: ResizableShape; handle: ResizeHandle }
  | { kind: "quick-connect"; shape: ResizableShape; side: ConnectorSide }
  | { kind: "column"; handle: TableHandle };
