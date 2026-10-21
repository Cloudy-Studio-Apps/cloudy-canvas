import type { LineSpan } from "./text-lines.types";

export interface LineHighlightProps {
  span: LineSpan;
  /** Measured from the textarea, in pixels. */
  lineHeight: number;
  paddingTop: number;
  scrollTop: number;
}
