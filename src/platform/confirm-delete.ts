import { ask } from "@tauri-apps/plugin-dialog";

import { tCommon } from "@shared/core";
import { t } from "./platform.i18n";

/** Asks the system whether to delete a file for good. */
export function confirmDelete(name: string): Promise<boolean> {
  return ask(t("deleteFile.message", { name }), {
    title: t("deleteFile.title"),
    kind: "warning",
    okLabel: t("deleteFile.ok"),
    cancelLabel: tCommon("cancel"),
  });
}
