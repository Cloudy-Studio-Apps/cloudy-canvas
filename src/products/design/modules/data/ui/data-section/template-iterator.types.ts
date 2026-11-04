import type { RepeatSettings } from "../../repeat";

/** The iterator whose template a layer is (or is inside), and its repeat. */
export interface TemplateIterator {
  frameId: string;
  repeat: RepeatSettings;
}
