import { ChevronDown, ListChecks } from "lucide-react";

import { CATALOG_PICK_TOOL } from "../../mode/catalog-mode.constants";
import { findPreset } from "../../../frame";
import { FramePresetPicker } from "../../../frame/ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { addBlankPage } from "../page-actions";
import { t } from "../../catalog.i18n";

/** A4 in points (the paper frame preset's size), for a catalog started from nothing. */
const A4 = findPreset("a4")?.size ?? { w: 595, h: 842 };

/**
 * The brochure with no pages yet: pick the design's frames, or start with a blank page (for a
 * catalog made from scratch): A4 either way, or any frame size.
 */
export function BrochureEmpty() {
  const engine = useDesignEngine();
  return (
    <div className="m-3 rounded-card border border-dashed border-border-strong p-4 text-center text-xs text-muted-foreground">
      <p className="mb-1 text-sm font-medium text-foreground">{t("tab.empty.title")}</p>
      <p>{t("tab.empty.hint")}</p>
      <Button size="sm" className="mt-3 w-full" onClick={() => engine.setTool(CATALOG_PICK_TOOL)}>
        <ListChecks />
        {t("tab.empty.pick")}
      </Button>
      <p className="mt-4 mb-1.5">{t("tab.empty.orBlank")}</p>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => addBlankPage(engine, A4, "A4")}
        >
          {t("tab.empty.a4Portrait")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => addBlankPage(engine, { w: A4.h, h: A4.w }, "A4 landscape")}
        >
          {t("tab.empty.a4Landscape")}
        </Button>
      </div>
      <FramePresetPicker
        onPick={(preset) => addBlankPage(engine, preset.size, preset.label)}
        trigger={
          <Button size="sm" variant="outline" className="mt-1.5 w-full">
            {t("tab.empty.otherSize")}
            <ChevronDown />
          </Button>
        }
      />
    </div>
  );
}
