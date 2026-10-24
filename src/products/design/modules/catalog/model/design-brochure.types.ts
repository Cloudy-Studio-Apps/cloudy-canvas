import type { Point } from "@canvas";

/** Told what an arrange moved: each moved node's offset (see `arrangeBrochure`). */
export type ArrangedListener = (moved: ReadonlyMap<string, Point>) => void;
