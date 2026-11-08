import type { FrameElement } from "../../../frame";
import type { PrototypeFlowElement } from "../../model";

export interface FlowRowProps {
  flow: PrototypeFlowElement;
  /** The screens of the page, to name where the flow starts. */
  screens: readonly FrameElement[];
  selected: boolean;
  onSelect: () => void;
}
