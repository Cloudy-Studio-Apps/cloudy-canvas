import { clipboard } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import { t } from "../color-wizard.i18n";

/** Copies text and says so (or why it couldn't). */
export function copyText(text: string, kind: "codes" | "hex"): void {
  clipboard.writeText(text).then(
    () => toast({ title: kind === "codes" ? t("copy.codes") : t("copy.hex", { hex: text }) }),
    (error: unknown) =>
      notifyError(kind === "codes" ? t("copy.codesFailed") : t("copy.hexFailed"), error),
  );
}
