import { useWhatsNewStore } from "@shared/stores/whats-new-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { bundledChangelog } from "./bundled-changelog";
import { ChangelogGroups } from "./changelog-groups";
import { formatReleaseDate } from "./format-release-date";
import { t } from "./app-updates.i18n";

/**
 * A coming version's changes, or every version's so far (`openWhatsNew`). Mounted once, by
 * `AppUpdates`.
 */
export function WhatsNewDialog() {
  const content = useWhatsNewStore((s) => s.content);
  const close = useWhatsNewStore((s) => s.close);
  const history = content?.kind === "history" ? bundledChangelog() : [];

  return (
    <Dialog open={content !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {content?.kind === "update"
              ? t("whatsNew.updateTitle", { version: content.version })
              : t("whatsNew.historyTitle")}
          </DialogTitle>
          <DialogDescription>
            {content?.kind === "update"
              ? t("whatsNew.updateDescription")
              : t("whatsNew.historyDescription", { version: __APP_VERSION__ })}
          </DialogDescription>
        </DialogHeader>

        {content?.kind === "update" && (
          <div className="border-t px-6 py-4">
            <ChangelogGroups groups={content.groups} />
          </div>
        )}

        {content?.kind === "history" &&
          (history.length === 0 ? (
            <p className="border-t px-6 py-4 text-sm text-muted-foreground">
              {t("whatsNew.empty")}
            </p>
          ) : (
            history.map((entry) => (
              <section key={entry.version ?? "unreleased"} className="space-y-3 border-t px-6 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {entry.version ?? t("whatsNew.unreleased")}
                  </h3>
                  {entry.date && (
                    <span className="text-xs text-muted-foreground">
                      {formatReleaseDate(entry.date)}
                    </span>
                  )}
                </div>
                <ChangelogGroups groups={entry.groups} />
              </section>
            ))
          ))}
      </DialogContent>
    </Dialog>
  );
}
