export interface CollaboratorOverflowProps {
  /** How many collaborators the stack left out. */
  count: number;
  /** Picking one in the menu follows it. */
  followable: boolean;
  side: "top" | "bottom" | "left" | "right";
}
