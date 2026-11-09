import { t } from "./join.i18n";

/** End titles, by why the session ended for this guest. */
export const END_TITLES = {
  ended: t("end.ended"),
  removed: t("end.removed"),
  denied: t("end.denied"),
  lost: t("end.lost"),
  failed: t("end.failed"),
} as const;
