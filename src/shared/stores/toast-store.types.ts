/** `loading` shows a spinner and stays until it is dismissed (see `toastProgress`). */
export type ToastTone = "info" | "error" | "loading";

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: ToastAction;
}

export interface Toast extends ToastOptions {
  id: string;
  tone: ToastTone;
}

export interface ToastState {
  toasts: Toast[];
  /** Shows a toast and returns its id. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

/** The toasts `toastProgress` shows while a task runs, and after it. */
export interface ProgressToastOptions {
  /** e.g. "Exporting…", shown with a spinner while the task runs. */
  loading: string;
  /** Shown when it succeeds; nothing is shown when it's left out. */
  success?: string;
  /** The title of the error toast when it fails. */
  error: string;
}
