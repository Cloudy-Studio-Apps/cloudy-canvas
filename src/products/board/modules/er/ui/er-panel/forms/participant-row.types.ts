import type { ErParticipant, ErRelationElement } from "../../../relation/relation.types";
import type { ShapeSelectOption } from "./shape-select.types";

export interface ParticipantRowProps {
  relation: ErRelationElement;
  participant: ErParticipant;
  options: readonly ShapeSelectOption[];
}
