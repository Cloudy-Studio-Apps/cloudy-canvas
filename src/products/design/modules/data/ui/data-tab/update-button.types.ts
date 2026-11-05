import type { UpdateProgress } from "../../model";
import type { UpdateStage } from "../../update";

export interface UpdateButtonProps {
  /** What the running Update is doing, `null` when none runs. */
  stage: UpdateStage | null;
  /** How many of the pictures it saves are in (while it saves them). */
  progress?: UpdateProgress | null;
  /** Whether a click while it runs cancels it. */
  cancellable: boolean;
  onRun: () => void;
  onCancel: () => void;
  /** The idle button's name (default: "Update"). */
  label?: string;
  /** Whether Update is unavailable (a source whose plugin isn't installed). */
  disabled?: boolean;
}
