import { ExportDataDialog } from "./export-data-dialog";
import { useExportDataStore } from "./stores/export-data-store";

/** Shows the question a brochure export is waiting on (`useExportDataStore`), in the Catalog mode. */
export function ExportDataPrompt() {
  const question = useExportDataStore((state) => state.question);
  const answer = useExportDataStore((state) => state.answer);
  return <ExportDataDialog sources={question?.sources ?? null} onAnswer={answer} />;
}
