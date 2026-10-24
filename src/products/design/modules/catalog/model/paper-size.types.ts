/** A page's printed size. */
export interface PaperSize {
  /** Millimetres. */
  width: number;
  height: number;
  /** The paper it matches with its orientation ("A4 landscape"), or `null` for another size. */
  name: string | null;
}
