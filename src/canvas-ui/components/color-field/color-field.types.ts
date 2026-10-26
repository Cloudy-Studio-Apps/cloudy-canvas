import type { ReactNode } from "react";

import type { ColorChangeInfo } from "../color";

/** A color and its opacity, as a color field reports them. */
export interface ColorValue {
  /** `#rrggbb`. */
  color: string;
  /** 0–1 (`1` for a field without opacity). */
  opacity: number;
}

export interface ColorPopoverProps {
  /** `#rrggbb`. */
  color: string;
  /** 0–1: the picker shows its opacity slider; left out for colors without one. */
  opacity?: number;
  /** What the color is ("Shadow color"): the trigger's "Edit …" label. */
  label: string;
  /** Every change: each step of a drag (`done: false`), its end and any pick (`done: true`). */
  onChange: (next: ColorValue, info: ColorChangeInfo) => void;
  /** What opens the picker (default: a swatch of the color). */
  trigger?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  /** Shown under the picker (e.g. a description field). */
  children?: ReactNode;
}

export interface ColorFieldProps {
  /** `#rrggbb`. */
  color: string;
  /** 0–1: shown and edited as a percentage; left out for colors without one. */
  opacity?: number;
  label: string;
  /** Show the hex field (default `true`). */
  hex?: boolean;
  onChange: (next: ColorValue, info: ColorChangeInfo) => void;
  className?: string;
}
