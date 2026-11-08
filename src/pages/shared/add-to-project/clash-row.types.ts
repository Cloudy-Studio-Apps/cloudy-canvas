import type { Clash, ClashChoice } from "@canvas";

export interface ClashRowProps {
  clash: Clash;
  /** The file's color and the library's, for a color variable. */
  colors: { file: string | null; library: string | null };
  onChange: (choice: ClashChoice) => void;
}
