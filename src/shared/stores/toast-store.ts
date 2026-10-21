import { create } from "zustand";

import { createId } from "@shared/core";
import type { Toast, ToastOptions, ToastState } from "./toast-store.types";

/** More than this and the oldest toasts are dropped. */
const MAX_TOASTS = 4;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (options) => {
    const id = createId();
    const next: Toast = { ...options, id, tone: options.tone ?? "info" };
    set((state) => ({ toasts: [...state.toasts, next].slice(-MAX_TOASTS) }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Shows a toast from anywhere (stores, hooks, event handlers). */
export function toast(options: ToastOptions): string {
  return useToastStore.getState().show(options);
}

/** Logs an error and tells the user about it, with the error's message as the description. */
export function notifyError(title: string, error: unknown): void {
  console.error(`[app] ${title}`, error);
  toast({ title, description: errorMessage(error), tone: "error" });
}

function errorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : undefined;
}
