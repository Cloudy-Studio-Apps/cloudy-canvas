import { tCommon } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";
import type { OverwriteDialogProps } from "./overwrite-dialog.types";
import { t } from "../db-export.i18n";

/** Asks before saving replaces files that are already in the chosen folder. */
export function OverwriteDialog({ request, onAnswer }: OverwriteDialogProps) {
  return (
    <AppDialog
      open={request !== null}
      onOpenChange={(open) => !open && onAnswer(false)}
      title={t("overwrite.title")}
      description={t("overwrite.description", { count: request?.existing.length ?? 0 })}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onAnswer(false)}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" onClick={() => onAnswer(true)}>
            {t("overwrite.replace")}
          </Button>
        </>
      }
    >
      <ul className="max-h-48 overflow-y-auto font-mono text-xs text-muted-foreground">
        {request?.existing.map((path) => (
          <li key={path}>{path}</li>
        ))}
      </ul>
    </AppDialog>
  );
}
