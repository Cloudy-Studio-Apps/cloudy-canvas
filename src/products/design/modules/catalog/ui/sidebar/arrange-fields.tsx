import { LayoutGrid } from "lucide-react";

import type { BrochureArrange } from "../../brochure/brochure.types";
import { useBrochure } from "../hooks/use-brochure";
import { Button, SelectField, type SelectOption } from "@shared/ui/kit";
import { t } from "../../catalog.i18n";

const ARRANGES: readonly SelectOption<BrochureArrange>[] = [
  { value: "off", label: t("arrange.off") },
  { value: "below", label: t("arrange.below") },
  { value: "beside", label: t("arrange.beside") },
];

/**
 * How the brochure's frames sit on the canvas: kept arranged after every edit (the printed pages
 * on one line by spread, the other options below or beside them) or left alone, and a button to
 * tidy them now.
 */
export function ArrangeFields() {
  const { brochure, settings, pages } = useBrochure();

  return (
    <div className="flex flex-col gap-1.5">
      <SelectField
        label={t("arrange.label")}
        value={settings.arrange}
        options={ARRANGES}
        onChange={(arrange) => brochure?.setSettings({ arrange })}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={!brochure || pages.length === 0}
        onClick={() => brochure?.arrange()}
      >
        <LayoutGrid />
        {t("arrange.now")}
      </Button>
    </div>
  );
}
