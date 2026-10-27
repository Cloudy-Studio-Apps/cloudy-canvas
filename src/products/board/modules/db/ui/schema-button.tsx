import { Braces } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { t } from "../db.i18n";

/** The top bar's button that shows the whole database schema in the side panel. */
export function SchemaButton() {
  const schemaOpen = useBoardPanelStore((state) => state.schemaOpen);
  const setSchemaOpen = useBoardPanelStore((state) => state.setSchemaOpen);

  return (
    <ToolButton
      label={t("schema.button")}
      side="bottom"
      active={schemaOpen}
      onClick={() => setSchemaOpen(!schemaOpen)}
    >
      <Braces />
    </ToolButton>
  );
}
