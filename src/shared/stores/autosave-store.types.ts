export interface AutosaveState {
  /** Open files are saved shortly after each change. On by default. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}
