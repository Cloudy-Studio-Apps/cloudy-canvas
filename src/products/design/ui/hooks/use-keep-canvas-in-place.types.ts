/** What `useKeepCanvasInPlace` needs of the engine. */
export interface PannableEngine {
  panBy(dx: number, dy: number): void;
}
