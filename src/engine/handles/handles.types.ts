import type {
  ConnectorShape,
  ConnectorSide,
  GeoShape,
  SectionShape,
  StickyShape,
} from "../document";
import type { TableHandle } from "../tools/tool.types";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export type ResizableShape = GeoShape | StickyShape | SectionShape;

/** Shapes that show quick-connect dots. */
export type QuickConnectShape = GeoShape | StickyShape;

/** What a press at a point grabs, before falling back to the shape under it. */
export type Interaction =
  | { kind: "endpoint"; connector: ConnectorShape; which: "start" | "end" }
  | { kind: "resize"; shape: ResizableShape; handle: ResizeHandle }
  | { kind: "quick-connect"; shape: QuickConnectShape; side: ConnectorSide }
  | { kind: "column"; handle: TableHandle }
  /** The × on a table's note bubble, or the icon that shows it again. */
  | { kind: "note-toggle"; tableId: string; hidden: boolean };
