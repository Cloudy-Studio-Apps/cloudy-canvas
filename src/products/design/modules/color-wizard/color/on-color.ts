import { contrastRatio } from "../../variables";

const WHITE = "#FFFFFF";
const BLACK = "#111111";

/** White or near-black, whichever reads better on `hex`. */
export function onColor(hex: string): string {
  return contrastRatio(WHITE, hex) >= contrastRatio(BLACK, hex) ? WHITE : BLACK;
}
