import type { ErElement, ErRelationRatio, ErRelationRatioId, ErRelationSide } from "@board";

export interface ErRelationGlyphProps {
  from: ErRelationSide;
  to: ErRelationSide;
}

export interface ErGlyphEndProps {
  side: ErRelationSide;
  /** Where the line meets the box, and which way the line runs from there. */
  at: number;
  dir: 1 | -1;
}

export interface ErRatioPickerProps {
  from: string;
  to: string;
  onPick: (id: ErRelationRatioId) => void;
}

/** A join choice as the select keeps it: `attr:<id>`, `new` (a new key) or `none`. */
export type ErJoinValue = string;

export interface ErJoinFieldProps {
  /** The entity whose attribute the other end links to. */
  entity: ErElement;
  /** The other end's name, for the label. */
  other: string;
  value: ErJoinValue;
  /** The name a new key attribute gets. */
  newKeyName: string;
  onChange: (value: ErJoinValue) => void;
}

export interface ErJoinStepProps {
  ratio: ErRelationRatio;
  from: ErElement;
  to: ErElement;
  onBack: () => void;
  onCreate: (joins: ReadonlyMap<"from" | "to", ErJoinValue>) => void;
}

/** The kind picked in the prompt, for the request it was picked for. */
export interface ErPickedRatio {
  request: unknown;
  id: ErRelationRatioId;
}
