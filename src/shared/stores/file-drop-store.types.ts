import type { FileDrop } from "@shared/core";

export interface FileDropState {
  /** What the open editor does with dropped files that aren't canvas files; `null` without one. */
  target: ((drop: FileDrop) => void) | null;
  setTarget: (target: ((drop: FileDrop) => void) | null) => void;
}
