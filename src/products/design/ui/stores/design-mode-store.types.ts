export interface DesignModeState {
  /** File id → the mode it was left in, for files left in a mode other than the default. */
  modes: Record<string, string>;
  /** Remembers the mode a file is in (the default mode forgets it). */
  remember: (fileId: string, mode: string) => void;
}
