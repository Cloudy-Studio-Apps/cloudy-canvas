import { useState } from "react";
import { Trash2 } from "lucide-react";

import { formatSize } from "@shared/core";
import { Button, ConfirmDialog, EmptyState } from "@shared/ui/kit";
import { TRASH_COLUMNS, TrashRow } from "./components/trash-row";
import { useProjectContext } from "./project-context";
import { t } from "./project.i18n";

/** The Trash tab: what was deleted from the project, with Restore, and Empty trash. */
export function TrashTab() {
  const { trash, actions } = useProjectContext();
  const [confirming, setConfirming] = useState(false);

  if (trash.count === 0) {
    return (
      <EmptyState
        icon={<Trash2 />}
        title={t("trash.emptyTitle")}
        description={t("trash.emptyText")}
        className="mx-auto max-w-md py-16"
      />
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2">
        <span className="grow text-sm text-muted-foreground">
          {t("trash.summary", { count: trash.count, size: formatSize(trash.size) })}
        </span>
        <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
          <Trash2 />
          {t("trash.empty")}
        </Button>
      </div>
      <div className="rounded-card border bg-surface">
        <div
          className={`grid ${TRASH_COLUMNS} gap-3 border-b px-3 py-2 text-xs font-medium text-muted-foreground`}
        >
          <span>{t("trash.name")}</span>
          <span>{t("trash.wasIn")}</span>
          <span>{t("trash.deleted")}</span>
          <span>{t("trash.size")}</span>
          <span />
        </div>
        {trash.entries.map((entry) => (
          <TrashRow key={entry.id} entry={entry} />
        ))}
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("trash.confirmTitle")}
        description={t("trash.confirmText", { count: trash.count, size: formatSize(trash.size) })}
        confirmLabel={t("trash.empty")}
        destructive
        onConfirm={() => void actions.emptyTrash()}
      />
    </div>
  );
}
