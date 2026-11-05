import type { DataPreviewStep } from "../../data.points.types";

/** A card repeater's loop as In scope shows it: where it comes from and its stepper, if any. */
export interface CardLoopPreview {
  from: string;
  step: DataPreviewStep | null;
}
