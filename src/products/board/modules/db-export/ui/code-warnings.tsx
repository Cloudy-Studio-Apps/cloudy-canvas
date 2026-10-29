import { TriangleAlert } from "lucide-react";

import { warningText } from "../targets";
import type { CodeWarningsProps } from "./code-warnings.types";
import { t } from "../db-export.i18n";

/** What the export couldn't write as the schema says. */
export function CodeWarnings({ warnings }: CodeWarningsProps) {
  if (warnings.length === 0) return null;
  return (
    <details className="rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs">
      <summary className="flex cursor-pointer items-center gap-1.5 font-medium text-warning">
        <TriangleAlert className="size-3.5" />
        {t("dialog.warnings", { count: warnings.length })}
      </summary>
      <ul className="mt-1.5 flex max-h-28 list-disc flex-col gap-1 overflow-y-auto pl-5 text-muted-foreground">
        {warnings.map((warning, i) => (
          <li key={i}>{warningText(warning)}</li>
        ))}
      </ul>
    </details>
  );
}
