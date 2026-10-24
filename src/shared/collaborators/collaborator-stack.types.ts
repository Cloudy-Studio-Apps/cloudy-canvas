export interface CollaboratorStackProps {
  /** Clicking a collaborator follows it (in an editor; not on Home). */
  followable?: boolean;
  /** Where the tooltips and the overflow menu open. */
  side?: "top" | "bottom" | "left" | "right";
  /** How many avatars show before the rest fold into a "+N" button (default 3). */
  max?: number;
  className?: string;
}
