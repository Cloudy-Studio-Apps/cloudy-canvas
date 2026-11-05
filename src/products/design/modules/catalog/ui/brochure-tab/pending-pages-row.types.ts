export interface PendingPagesRowProps {
  /** The pages it stands for. */
  count: number;
  /** How far it's indented: the sections it's in. */
  depth: number;
  /** Its repeat run's bracket depth (`PageTreeRow.bracket`). */
  bracket: number | null;
}
