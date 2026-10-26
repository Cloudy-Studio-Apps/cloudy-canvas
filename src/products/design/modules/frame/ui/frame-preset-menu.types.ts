import type { ReactNode } from "react";

import type { FramePreset } from "../frame.types";

export interface FramePresetMenuProps {
  /** The button that opens the menu. */
  trigger: ReactNode;
  onPick: (preset: FramePreset) => void;
}
