/** What the selection says about the board's ER diagrams. */
export interface ErSelection {
  /** Some of the selected elements belong to an ER diagram. */
  any: boolean;
  /** The selected ER element, when exactly one element is selected and it's one. */
  id: string | null;
  /** The diagram the selected ER elements belong to, when they all belong to one. */
  diagram: string | null;
}
