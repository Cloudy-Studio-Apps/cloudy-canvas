import { relativeTime } from "@shared/core";
import { t } from "./home.i18n";

export function formatRelativeTime(iso: string, now = Date.now()): string {
  return relativeTime(iso, now) ?? t("card.justNow");
}
