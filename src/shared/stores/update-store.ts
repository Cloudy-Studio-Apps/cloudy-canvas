import { create } from "zustand";

import { appLifecycle, appUpdater, openExternal } from "@platform";
import { notifyError } from "./toast-store";
import type { UpdateState } from "./update-store.types";

/** Development builds never update themselves. */
const updater = import.meta.env.DEV ? null : appUpdater;

/** Checking for and installing new versions of the app (`AppUpdater` from `@platform`). */
export const useUpdateStore = create<UpdateState>()((set, get) => ({
  status: { phase: "idle" },
  installKind: null,
  dismissed: null,

  check: async ({ silent = false } = {}) => {
    const { status } = get();
    if (!updater || status.phase === "checking" || status.phase === "downloading") return;
    if (status.phase === "restarting") return;
    set({ status: { phase: "checking" } });
    try {
      const [installKind, update] = await Promise.all([updater.installKind(), updater.check()]);
      set({ installKind, status: update ? { phase: "available", update } : { phase: "upToDate" } });
    } catch (error) {
      set({ status: { phase: "error", message: errorText(error) } });
      if (silent) console.warn("[updates] Couldn't check for updates:", error);
      else notifyError("Couldn't check for updates", error);
    }
  },

  install: async () => {
    const { status, installKind } = get();
    if (status.phase !== "available") return;
    const { update } = status;
    if (installKind === "package") {
      await openExternal(update.releaseUrl).catch((error: unknown) =>
        notifyError("The download page couldn't be opened", error),
      );
      return;
    }
    set({ status: { phase: "downloading", update, progress: null } });
    try {
      // The installer closes the app: let pending autosaves finish first.
      await appLifecycle.runQuitTasks();
      await update.install((progress) => {
        if (progress === 1) set({ status: { phase: "restarting", update } });
        else set({ status: { phase: "downloading", update, progress } });
      });
    } catch (error) {
      set({ status: { phase: "available", update } });
      notifyError("The update couldn't be installed", error);
    }
  },

  dismiss: () => {
    const { status } = get();
    if (status.phase === "available") set({ dismissed: status.update.version });
  },
}));

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}
