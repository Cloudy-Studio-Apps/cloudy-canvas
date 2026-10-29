import { FileCode } from "lucide-react";

import type { DbPanelActionProps } from "../../db/ui";
import { Button } from "@shared/ui/kit";
import { useCodeExportStore } from "./code-export-store";
import { t } from "../db-export.i18n";

/** The database panel's Export code button: the shown table, or the whole schema. */
export function ExportCodeButton({ tableId }: DbPanelActionProps) {
  const open = useCodeExportStore((state) => state.open);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label={t("button.label")}
      title={tableId ? t("button.table") : t("button.schema")}
      onClick={() => open(tableId ? [tableId] : [])}
    >
      <FileCode />
    </Button>
  );
}
