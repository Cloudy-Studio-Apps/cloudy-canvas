import type { ErParticipant, ErRelationShape } from "@engine";
import type { ShapeSelectOption } from "./shape-select.types";

export interface ParticipantRowProps {
  relation: ErRelationShape;
  participant: ErParticipant;
  options: readonly ShapeSelectOption[];
}
