import type { ReportLoading } from "@shared/stores/loading-store.types";
import { toast } from "@shared/stores/toast-store";
import { t } from "./file.i18n";

/** Most losses listed in the toast; the rest are summed up. */
const LISTED_WARNINGS = 4;

/**
 * Reports an import's stage, then waits a frame so the loading screen shows it before the work
 * blocks.
 */
export function importStep(report: ReportLoading, stage: string): Promise<void> {
  report(stage);
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
}

/** Lists in a toast what an import couldn't bring over as it was, when anything. */
export function toastImportWarnings(warnings: readonly string[]): void {
  if (warnings.length === 0) return;
  const listed = warnings.slice(0, LISTED_WARNINGS).join("; ");
  const more = warnings.length - LISTED_WARNINGS;
  const description = more > 0 ? t("import.more", { list: listed, count: more }) : `${listed}.`;
  toast({ title: t("import.title"), description });
}
