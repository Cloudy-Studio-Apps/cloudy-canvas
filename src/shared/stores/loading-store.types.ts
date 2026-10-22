/** How far a long task has got, when it can count its steps. */
export interface LoadingProgress {
  done: number;
  total: number;
}

/** A long task the whole window waits for (e.g. importing a Figma file). */
export interface LoadingTask {
  /** e.g. "Importing Landing page.fig". */
  title: string;
  /** What it's doing now, e.g. "Converting layers". */
  stage: string;
  progress: LoadingProgress | null;
}

/** Tells the loading screen what a task is doing now. */
export type ReportLoading = (stage: string, progress?: LoadingProgress | null) => void;

export interface LoadingState {
  task: LoadingTask | null;
  set: (task: LoadingTask | null) => void;
}
