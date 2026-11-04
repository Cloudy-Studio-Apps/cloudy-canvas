import type { BrochureMaster } from "../../brochure/brochure.types";

export interface MasterRowProps {
  master: BrochureMaster;
  /** Whether it's the brochure's default master. */
  isDefault: boolean;
  /** Whether one of its frames is selected. */
  selected: boolean;
}

export interface MasterSideThumbProps {
  /** The side's frame, `null` when it's gone. */
  frame: string | null;
  label: string;
}
