export interface PaintRecentsState {
  /** Solid colors picked last (`#rrggbb`), newest first. */
  colors: string[];
  add: (color: string) => void;
}
