export interface DragGhostProps {
  label: string;
  pointer: { x: number; y: number };
  /** Greyed, when it can't be dropped where it is. */
  muted?: boolean;
}
