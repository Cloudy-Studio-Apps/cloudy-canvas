/** The sticky tool's options: the color of new notes (and of the selected ones). */
export interface StickyToolOptions {
  stickyColor: string;
  /** The color variable the color is bound to (`null`: the color as picked). */
  stickyColorToken: string | null;
}
