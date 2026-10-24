import { Ruler } from "lucide-react";

import { DESIGN_BROCHURE, paperSize } from "@design";
import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { Toggle } from "./toggle";

/** The export's resolutions to pick from. */
const DPI_CHOICES = [
  { dpi: 300, label: "Print · 300 dpi" },
  { dpi: 150, label: "Draft · 150 dpi" },
  { dpi: 96, label: "Screen · 96 dpi" },
];

/** How the brochure prints: its page size, facing pages, margin and resolution. */
export function BrochureSettingsSection() {
  const engine = useDesignEngine();
  const { pages, settings } = useBrochure();
  const margins = useCatalogViewStore((state) => state.margins);
  const setMargins = useCatalogViewStore((state) => state.setMargins);
  const brochure = engine.service(DESIGN_BROCHURE);
  const first = pages[0]?.frame;
  const paper = first && paperSize(first);

  return (
    <PanelSection title="Brochure">
      <p className="text-sm text-foreground">
        {pages.length} {pages.length === 1 ? "page" : "pages"}
        {paper && (
          <span className="text-muted-foreground">
            {" "}
            · {paper.name ?? `${paper.width} × ${paper.height} mm`}
          </span>
        )}
      </p>
      <div className="mt-2.5 flex flex-col gap-2">
        <Toggle
          label="Facing pages (spreads)"
          checked={settings.facing}
          onChange={(facing) => brochure.setSettings({ facing })}
        />
        <PropertyGrid>
          <NumberField
            prefix={<Ruler className="size-3.5" />}
            label="Margin"
            value={settings.margin}
            suffix="mm"
            min={0}
            onCommit={(margin) => brochure.setSettings({ margin })}
          />
          <Select
            value={String(settings.dpi)}
            onValueChange={(value) => brochure.setSettings({ dpi: Number(value) })}
          >
            <SelectTrigger aria-label="Quality" title="Quality" className="h-7 w-full text-xs">
              <SelectValue placeholder={`${settings.dpi} dpi`} />
            </SelectTrigger>
            <SelectContent>
              {DPI_CHOICES.map(({ dpi, label }) => (
                <SelectItem key={dpi} value={String(dpi)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PropertyGrid>
        <Toggle label="Show margins on the canvas" checked={margins} onChange={setMargins} />
      </div>
    </PanelSection>
  );
}
