/** The rows a virtual list draws: `[start, end)` of `count`, and the height they all take. */
export interface VirtualRange {
  start: number;
  end: number;
  totalHeight: number;
}
