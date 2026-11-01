import { Scissors } from "lucide-react";

import { NumberField, PanelSection } from "@design/ui/components/panel";
import { CheckboxField } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

/** What the PDF adds for a print shop: the bleed and the crop marks. */
export function PrintSection() {
  const { brochure, settings } = useBrochure();
  return (
    <PanelSection title={t("print.title")}>
      <div className="flex flex-col gap-2">
        <NumberField
          prefix={<Scissors className="size-3.5" />}
          label={t("print.bleed")}
          value={settings.bleed}
          suffix="mm"
          min={0}
          onCommit={(bleed) => brochure?.setSettings({ bleed })}
        />
        <CheckboxField
          label={t("print.cropMarks")}
          checked={settings.cropMarks}
          onChange={(cropMarks) => brochure?.setSettings({ cropMarks })}
        />
      </div>
    </PanelSection>
  );
}
