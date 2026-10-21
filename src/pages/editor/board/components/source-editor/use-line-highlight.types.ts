import type { RefCallback, UIEventHandler } from "react";

import type { LineHighlightProps } from "./line-highlight.types";

export interface TextareaMetrics {
  lineHeight: number;
  paddingTop: number;
}

export interface LineHighlightState {
  ref: RefCallback<HTMLTextAreaElement>;
  onScroll: UIEventHandler<HTMLTextAreaElement>;
  /** Props for `LineHighlight`, or null when nothing is highlighted. */
  band: LineHighlightProps | null;
}
