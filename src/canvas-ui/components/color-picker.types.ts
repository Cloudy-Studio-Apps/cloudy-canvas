import type { ReactNode } from "react";

import type { ColorChangeInfo } from "./color";

export interface ColorPickerProps {
  /** Current color, as `#rrggbb`. */
  color: string;
  /** 0–1: shows the opacity slider and field; left out for colors without one. */
  opacity?: number;
  /** Every change: each step of a drag (`done: false`), its end and any pick (`done: true`). */
  onChange: (color: string, info: ColorChangeInfo, opacity: number) => void;
  /** Shown between the controls and the recent colors (e.g. the page's colors). */
  extra?: ReactNode;
}
