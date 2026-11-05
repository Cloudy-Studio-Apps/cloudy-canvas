export interface ShapeFieldRowProps {
  /** The field's path as read. */
  path: string;
  /** Its new name, `""` when it keeps its path. */
  name: string;
  kept: boolean;
  onKeep(keep: boolean): void;
  onRename(name: string): void;
}
