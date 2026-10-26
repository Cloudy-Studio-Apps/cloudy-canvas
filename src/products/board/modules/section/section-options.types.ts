/** The section tool's options: the color of new sections (and of the selected ones). */
export interface SectionToolOptions {
  sectionColor: string;
  /** The color variable the color is bound to (`null`: the color as picked). */
  sectionColorToken: string | null;
}
