import { toast } from "@shared/stores/toast-store";
import { UnreadableCopyError } from "../model/repeats/unreadable-copy-error";
import { t } from "../catalog.i18n";

/**
 * Runs an edit that may detach or delete a page a repeat made; one refused because the page's
 * rows can't be read on this device (`UnreadableCopyError`, nothing written) says so in a toast.
 * Returns the edit's result, `undefined` when refused.
 */
export function runCopyEdit<T>(edit: () => T): T | undefined {
  try {
    return edit();
  } catch (error) {
    if (!(error instanceof UnreadableCopyError)) throw error;
    toast({ title: t("repeat.unreadable") });
    return undefined;
  }
}
