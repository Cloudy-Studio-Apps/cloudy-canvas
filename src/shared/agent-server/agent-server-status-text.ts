/** One line on whether and where agents can connect. */
import { t } from "./agent-server.i18n";
export function agentServerStatusText(
  available: boolean,
  enabled: boolean,
  url: string | null,
): string {
  if (!available) return t("status.desktopOnly");
  if (!enabled) return t("status.off");
  if (!url) return t("status.starting");
  return t("status.connectAt", { url });
}
