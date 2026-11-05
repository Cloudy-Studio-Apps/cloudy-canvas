import { relativeTime } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";
import type { ExportDataDialogProps } from "./export-data-dialog.types";
import type { ExportDataSource } from "./stores/export-data-store.types";
import { t } from "../catalog.i18n";

/** When a source's data was last updated, in words ("updated 3 days ago"). */
function updatedText(source: ExportDataSource): string {
  if (source.missing) return t("exportData.missing");
  if (source.updatedAt === null) return t("exportData.neverUpdated");
  const ago = relativeTime(source.updatedAt);
  return ago ? t("exportData.updatedAgo", { time: ago }) : t("exportData.updatedNow");
}

/**
 * Asks how a brochure export reads its data: updating the sources it reads first (the main
 * choice) or using the data saved in the file, each source listed with when it was last updated
 * (or that its data isn't on this device: the export then refuses the saved data). Esc cancels
 * the export.
 */
export function ExportDataDialog({ sources, onAnswer }: ExportDataDialogProps) {
  return (
    <AppDialog
      open={sources !== null}
      onOpenChange={(open) => {
        if (!open) onAnswer(null);
      }}
      size="sm"
      title={t("exportData.title")}
      description={t("exportData.description")}
      footer={
        <>
          <Button variant="outline" onClick={() => onAnswer("saved")}>
            {t("exportData.saved")}
          </Button>
          <Button onClick={() => onAnswer("update")}>{t("exportData.update")}</Button>
        </>
      }
    >
      <ul className="grid gap-1.5 text-sm">
        {(sources ?? []).map((source) => (
          <li key={source.id} className="flex items-baseline justify-between gap-3">
            <span className="truncate font-medium">{source.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{updatedText(source)}</span>
          </li>
        ))}
      </ul>
    </AppDialog>
  );
}
