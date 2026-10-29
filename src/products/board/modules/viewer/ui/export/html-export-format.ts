import type { ExportFormatEntry } from "@canvas-ui";
import { t } from "../../viewer.i18n";
import { collectElements } from "./collect-elements";
import { exportBoardHtml } from "./export-html";

/** The board's HTML export in the Export dialog, saying which plugins will show as placeholders. */
export const htmlExportFormat: ExportFormatEntry = {
  id: "html",
  name: "HTML",
  extension: "html",
  label: t("export.format"),
  note(engine) {
    const { placeholders } = collectElements(engine);
    if (placeholders.size === 0) return null;
    const count = [...placeholders.values()].reduce((sum, n) => sum + n, 0);
    return t("export.placeholders", { count, plugins: [...placeholders.keys()].join(", ") });
  },
  run: exportBoardHtml,
};
