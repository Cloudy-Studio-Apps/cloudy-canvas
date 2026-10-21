import type { AnyElement } from "../elements";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/** What a press at a point grabs, before falling back to the element under it. */
export type Interaction = { kind: "resize"; element: AnyElement; handle: ResizeHandle };
