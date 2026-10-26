import type { ReactNode } from "react";

import type { FramePreset } from "../frame.types";

export interface FramePresetPickerProps {
  /** The button that opens the menu. */
  trigger: ReactNode;
  onPick: (preset: FramePreset) => void;
}
