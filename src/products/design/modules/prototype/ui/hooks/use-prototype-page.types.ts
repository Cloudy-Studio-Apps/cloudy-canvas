import type { FrameElement } from "../../../frame";
import type { PrototypeFlowElement } from "../../model";

/** The design page on screen, as the prototype sees it. */
export interface PrototypePageView {
  /** The page's id, `null` without one. */
  page: string | null;
  /** Its flows, in order. */
  flows: PrototypeFlowElement[];
  /** Its screens, in layer order. */
  screens: FrameElement[];
}
