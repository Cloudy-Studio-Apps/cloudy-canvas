/** Colors the host app provides (resolved from its theme tokens) as 0xRRGGBB numbers. */
export interface CanvasTheme {
  background: number;
  grid: number;
  selection: number;
  /** Links between elements (see `CanvasLinks`), e.g. database relations. */
  relation: number;
}
