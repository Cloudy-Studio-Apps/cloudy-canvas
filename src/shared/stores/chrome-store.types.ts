export interface ChromeState {
  /** The editor's UI is hidden (Ctrl+\): only the canvas shows. */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}
