import type { TokenRecord } from "@canvas";

/** The colors read from a file, with what it was and what couldn't be brought over. */
export interface ColorSource {
  /** What the file was ("Cloudy Canvas file", "Tokens Studio", …). */
  label: string;
  records: TokenRecord[];
  warnings: string[];
}
