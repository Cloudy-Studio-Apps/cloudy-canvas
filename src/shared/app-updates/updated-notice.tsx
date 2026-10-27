import { useEffect } from "react";

import { useLastSeenVersionStore } from "@shared/stores/last-seen-version-store";
import { useUpdateStore } from "@shared/stores/update-store";
import { openWhatsNew } from "@shared/stores/whats-new-store";
import { Button } from "@shared/ui/components/ui/button";
import { bundledChangesOf } from "./bundled-changelog";
import { NoticeCard } from "./notice-card";
import { t } from "./app-updates.i18n";

/**
 * The card shown once after the app updated, when the changelog lists the running version's
 * changes. A first start, or a version without changes, just remembers the version.
 */
export function UpdatedNotice() {
  const seen = useLastSeenVersionStore((s) => s.version);
  const see = useLastSeenVersionStore((s) => s.see);
  const updating = useUpdateStore((s) => "update" in s.status);
  const changes = bundledChangesOf(__APP_VERSION__);

  useEffect(() => {
    if (seen === null || !changes) see(__APP_VERSION__);
  }, [seen, changes, see]);

  if (seen === null || seen === __APP_VERSION__ || !changes || updating) return null;

  const done = () => see(__APP_VERSION__);
  return (
    <NoticeCard
      title={t("updated.title", { version: __APP_VERSION__ })}
      description={t("updated.description")}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            done();
            openWhatsNew({ kind: "update", version: __APP_VERSION__, groups: changes.groups });
          }}
        >
          {t("notice.whatsNew")}
        </Button>
        <Button size="sm" variant="ghost" onClick={done}>
          {t("updated.dismiss")}
        </Button>
      </div>
    </NoticeCard>
  );
}
