/** The desktop window's own controls, for a custom title bar. Implemented per platform in `platform/`. */
export interface WindowChrome {
  minimize(): void;
  toggleMaximize(): void;
  /** Closes through the window's close request, so the quit guard still runs. */
  close(): void;
  setTitle(title: string): void;
  isMaximized(): Promise<boolean>;
  /** Calls `listener` when the window is maximized or restored. Returns an unsubscribe function. */
  onMaximizedChange(listener: (maximized: boolean) => void): () => void;
  /** Whether the app draws the minimize/maximize/close buttons (false where the system does, macOS). */
  readonly drawsControls: boolean;
}
