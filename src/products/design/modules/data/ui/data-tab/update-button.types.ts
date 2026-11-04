import type { UpdateStage } from "../../update";

export interface UpdateButtonProps {
  /** What the running Update is doing, `null` when none runs. */
  stage: UpdateStage | null;
  /** Whether a click while it runs cancels it. */
  cancellable: boolean;
  onRun: () => void;
  onCancel: () => void;
  /** The idle button's name (default: "Update"). */
  label?: string;
}
