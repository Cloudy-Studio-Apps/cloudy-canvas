import { openExternal } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "./about.i18n";

/** Opens a web page in the browser, telling the user when it can't. */
export function openLink(url: string): void {
  void openExternal(url).catch((error: unknown) => notifyError(t("openFailed"), error));
}
