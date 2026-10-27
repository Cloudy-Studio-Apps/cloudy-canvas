import { FileDown } from "lucide-react";

import { STYLEGUIDE_COMMANDS } from "../../mode/styleguide-mode.constants";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, Section } from "@shared/ui/kit";
import { useStyleguideOutline } from "../hooks/use-styleguide";
import { useSystemPage } from "../hooks/use-system-page";
import { ModesSwitch } from "./modes-switch";
import { t } from "../../styleguide.i18n";

/** The Design system view's own settings and export, when no section is picked. */
export function SystemOverview() {
  const engine = useDesignEngine();
  const page = useSystemPage();
  const shown = useStyleguideOutline().filter((entry) => entry.sheetId);
  if (!page) {
    return (
      <p className="px-3 py-2.5 text-xs text-muted-foreground">{t("sidebar.overview.empty")}</p>
    );
  }
  return (
    <Section title={t("sidebar.overview.title")}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          {t("sidebar.overview.summary", { count: shown.length })}
        </p>
        <ModesSwitch />
        <Button size="sm" onClick={() => engine.runHostAction(STYLEGUIDE_COMMANDS.exportSystem)}>
          <FileDown />
          {t("sidebar.overview.exportPdf")}
        </Button>
      </div>
    </Section>
  );
}
