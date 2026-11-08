import { openExternal } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { isWebAddress } from "../../model";
import { t } from "../../prototype.i18n";

/** An Open link interaction: the address in the system's browser, `http:` and `https:` only. */
export function openLink(url: string): void {
  if (!isWebAddress(url)) return;
  void openExternal(url).catch((error: unknown) => notifyError(t("player.linkFailed"), error));
}
