import type { LoadingProgress } from "@shared/stores/loading-store.types";

export interface LoadingScreenProps {
  /** What is loading, e.g. "Importing Landing page.fig". */
  title: string;
  /** What it's doing now, e.g. "Converting layers". */
  stage: string;
  /** Fills the bar when given; otherwise the bar slides (the task can't count its steps). */
  progress?: LoadingProgress | null;
  className?: string;
}
