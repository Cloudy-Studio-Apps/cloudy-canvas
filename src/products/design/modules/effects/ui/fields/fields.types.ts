import type { ReactNode } from "react";

import type { ColorChangeInfo } from "@canvas-ui";

export interface ScrubFieldProps {
  /** Shown before the value; dragging it changes the value (scrubbing). */
  prefix: ReactNode;
  label: string;
  value: number;
  onChange: (value: number, info: ColorChangeInfo) => void;
  min?: number;
  max?: number;
  /** How much a pixel of scrubbing changes the value (Shift: ten times as much). */
  step?: number;
  suffix?: string;
  /** Shown and typed as this many times the value (percentages of a 0–1 value: 100). */
  factor?: number;
  className?: string;
}

export interface EffectChoiceProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}
