export type ToastTone = "info" | "error";

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
