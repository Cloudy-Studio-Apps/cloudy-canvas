import type { UpdateStage } from "../../update";

/** A source's Update, as a button drives it. */
export interface SourceUpdate {
  /** Starts an Update (failures are shown as a notification). */
  run(): void;
  /** What the running Update is doing, `null` when none runs. */
  stage: UpdateStage | null;
  /** Stops the running Update (nothing is written). */
  cancel(): void;
  /** Whether `cancel` can stop the running one (an agent's Update can't be cancelled here). */
  cancellable: boolean;
}
