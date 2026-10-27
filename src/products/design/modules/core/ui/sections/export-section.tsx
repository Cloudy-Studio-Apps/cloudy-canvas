import { Download } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { t } from "../../core.i18n";

/** Opens the export dialog for the selection (or the page when nothing is selected). */
export function ExportSection() {
  const engine = useDesignEngine();
  return (
    <PanelSection title={t("sections.export")}>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => engine.commands.export?.()}
      >
        <Download />
        {t("exportSection.button")}
        <span className="ml-auto text-xs text-muted-foreground">
          {engine.keymap.label("export")}
        </span>
      </Button>
    </PanelSection>
  );
}
