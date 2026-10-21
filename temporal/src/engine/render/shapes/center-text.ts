import { LINE_HEIGHT } from "../../document";

/** Top offset that vertically centers one line of text in a box of `height`. */
export function centerTextTop(height: number, fontSize: number): number {
  return (height - fontSize * LINE_HEIGHT) / 2;
}
