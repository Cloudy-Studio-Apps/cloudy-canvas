import type { Size } from "@canvas";

import type { FrameElement } from "../../frame";
import type { SidePart } from "../model";

/** One page of the PDF: a frame (or half a spread frame), or a blank page of the brochure's size. */
export type PrintedPage =
  { kind: "frame"; frame: FrameElement; part: SidePart } | { kind: "blank"; size: Size };
