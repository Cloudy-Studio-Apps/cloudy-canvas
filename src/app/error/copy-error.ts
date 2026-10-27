import { clipboard } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import { t } from "./error.i18n";

/** Copies an error's code or details, for bug reports. */
export function copyError(text: string): void {
  void clipboard.writeText(text).then(
    () => toast({ title: t("copied") }),
    (error: unknown) => notifyError(t("copyFailed"), error),
  );
}
