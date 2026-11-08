import { Check } from "lucide-react";

import { Field } from "@shared/ui/kit";
import { ClashRow } from "./clash-row";
import type { StylesSummaryProps } from "./styles-summary.types";
import { t } from "./add-to-project.i18n";

/** What the file's styles do in the project: how many are new, and each clash with its choice. */
export function StylesSummary({ form }: StylesSummaryProps) {
  const { session, plan, libraries, libraryId } = form;
  const library = libraries.find((l) => l.id === libraryId)?.name ?? "";
  const opened = session.session;

  return (
    <Field label={t("dialog.styles")}>
      <div className="space-y-2 text-sm text-muted-foreground">
        {session.status === "loading" && <p>{t("dialog.reading")}</p>}
        {session.status === "failed" && (
          <p className="text-destructive">{t("dialog.readFailed")}</p>
        )}
        {form.linked && <p className="text-destructive">{t("dialog.linked")}</p>}
        {opened && !form.linked && !plan && <p>{t("dialog.noLibrary")}</p>}
        {opened && !form.linked && plan && (
          <>
            <p>
              {newCount(plan.added) > 0
                ? t("dialog.added", { count: newCount(plan.added), library })
                : t("dialog.nothingNew")}
              {opened.pictures() > 0 &&
                ` ${t("dialog.pictures", { count: opened.pictures(), library })}`}
            </p>
            {plan.clashes.length > 0 && (
              <>
                <p>{t("dialog.clashes", { count: plan.clashes.length })}</p>
                <ul className="max-h-56 space-y-1.5 overflow-y-auto">
                  {plan.clashes.map((clash) => (
                    <ClashRow
                      key={clash.fileId}
                      clash={clash}
                      colors={{
                        file: opened.colorOf(clash.fileId),
                        library: opened.colorOf(clash.libraryId),
                      }}
                      onChange={(choice) => form.choose(clash.fileId, choice)}
                    />
                  ))}
                </ul>
                <p className="flex items-start gap-2 rounded-md bg-surface-sunken px-2.5 py-2 text-xs">
                  <Check className="mt-0.5 size-3.5 shrink-0" />
                  {t("dialog.note", { example: plan.clashes[0]?.bothName ?? "" })}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </Field>
  );
}

/** The variables and styles among the records the library gets. */
function newCount(records: readonly { kind: string }[]): number {
  return records.filter((record) => record.kind === "variable" || record.kind === "style").length;
}
