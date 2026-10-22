import type { ReactNode } from "react";

import type { FramePreset } from "@design";

export interface FramePresetMenuProps {
  /** The button that opens the menu. */
  trigger: ReactNode;
  onPick: (preset: FramePreset) => void;
}
