import { getLocale, parseReleaseNotes } from "@shared/core";
import { useUpdateStore } from "@shared/stores/update-store";
import { openWhatsNew } from "@shared/stores/whats-new-store";
import { Button } from "@shared/ui/components/ui/button";
import { NoticeCard } from "./notice-card";
import { t } from "./app-updates.i18n";

/**
 * The card in the bottom-left corner while a new version is available: Update installs it (or
 * opens its download page for a package install), What's new shows its changes, Later hides it
 * until the next start.
 */
export function UpdateNotice() {
  const status = useUpdateStore((s) => s.status);
  const installKind = useUpdateStore((s) => s.installKind);
  const dismissed = useUpdateStore((s) => s.dismissed);
  const install = useUpdateStore((s) => s.install);
  const dismiss = useUpdateStore((s) => s.dismiss);

  if (!("update" in status)) return null;
  const { update } = status;
  if (status.phase === "available" && dismissed === update.version) return null;

  const busy = status.phase !== "available";
  const groups = parseReleaseNotes(update.notes, getLocale());
  const summary = groups[0]?.items[0]?.text.replaceAll("`", "");
  const progress = status.phase === "downloading" ? status.progress : 1;

  return (
    <NoticeCard
      title={t("notice.available", { version: update.version })}
      description={
        busy
          ? status.phase === "restarting"
            ? t("notice.restarting")
            : t("notice.downloading")
          : (summary ?? t("notice.youHave", { version: __APP_VERSION__ }))
      }
    >
      {busy ? (
        <div className="h-1.5 overflow-hidden rounded-md bg-muted">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${Math.round((progress ?? 0.1) * 100)}%` }}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void install()}>
            {installKind === "package" ? t("notice.download") : t("notice.updateRestart")}
          </Button>
          {groups.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openWhatsNew({ kind: "update", version: update.version, groups })}
            >
              {t("notice.whatsNew")}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {t("notice.later")}
          </Button>
        </div>
      )}
    </NoticeCard>
  );
}
