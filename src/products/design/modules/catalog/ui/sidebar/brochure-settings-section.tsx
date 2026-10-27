import { Ruler } from "lucide-react";

import { brochurePageSize } from "../../model/page-span";
import { paperSize } from "../../model/paper-size";
import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { ArrangeFields } from "./arrange-fields";
import { LayoutFields } from "./layout-fields";
import { CheckboxField, SelectField } from "@shared/ui/kit";
import { t } from "../../catalog.i18n";

/** The export's resolutions to pick from. */
const DPI_CHOICES = [
  { value: "300", label: t("settings.quality.print") },
  { value: "150", label: t("settings.quality.draft") },
  { value: "96", label: t("settings.quality.screen") },
] as const;

/**
 * How the brochure prints: its page count and size, how it's bound (`LayoutFields`), how its
 * frames sit on the canvas (`ArrangeFields`), its margin and resolution, and whether the margins show on the canvas.
 */
export function BrochureSettingsSection() {
  const { brochure, pages, layout, settings } = useBrochure();
  const margins = useCatalogViewStore((state) => state.margins);
  const setMargins = useCatalogViewStore((state) => state.setMargins);
  const size = brochurePageSize(pages);
  const paper = size && paperSize(size);
  const count = layout.pageCount;

  return (
    <PanelSection title={brochure?.name ?? t("settings.title")}>
      <p className="text-sm text-foreground">
        {count} {count === 1 ? "page" : "pages"}
        {paper && (
          <span className="text-muted-foreground">
            {" "}
            · {paper.name ?? `${paper.width} × ${paper.height} mm`}
          </span>
        )}
      </p>
      <div className="mt-2.5 flex flex-col gap-2">
        <LayoutFields />
        <ArrangeFields />
        <PropertyGrid>
          <NumberField
            prefix={<Ruler className="size-3.5" />}
            label={t("settings.margin")}
            value={settings.margin}
            suffix="mm"
            min={0}
            onCommit={(margin) => brochure?.setSettings({ margin })}
          />
          <SelectField
            label={t("settings.quality.label")}
            value={dpiChoice(settings.dpi)}
            options={DPI_CHOICES}
            onChange={(dpi) => brochure?.setSettings({ dpi: Number(dpi) })}
          />
        </PropertyGrid>
        <CheckboxField label={t("settings.showMargins")} checked={margins} onChange={setMargins} />
      </div>
    </PanelSection>
  );
}

/** The quality choice nearest a dpi (agents may set others). */
function dpiChoice(dpi: number): (typeof DPI_CHOICES)[number]["value"] {
  const nearest = [...DPI_CHOICES].sort(
    (a, b) => Math.abs(Number(a.value) - dpi) - Math.abs(Number(b.value) - dpi),
  )[0];
  return nearest?.value ?? "300";
}
