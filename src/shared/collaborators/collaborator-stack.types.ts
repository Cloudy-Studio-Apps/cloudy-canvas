export interface CollaboratorStackProps {
  /** Clicking a collaborator follows it (in an editor; not on Home). */
  followable?: boolean;
  /** Where the tooltips open. */
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
