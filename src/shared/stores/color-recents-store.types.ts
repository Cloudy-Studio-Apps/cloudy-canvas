export interface ColorRecentsState {
  /** Colors picked last (`#rrggbb`), newest first. */
  colors: string[];
  add: (color: string) => void;
}
