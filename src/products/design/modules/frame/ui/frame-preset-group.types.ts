import type { FramePreset, FramePresetGroup } from "../frame.types";

export interface FramePresetGroupProps {
  group: FramePresetGroup;
  open: boolean;
  onToggle: () => void;
  /** The preset a click with the frame tool places (highlighted). */
  current: string;
  onPick: (preset: FramePreset) => void;
}
