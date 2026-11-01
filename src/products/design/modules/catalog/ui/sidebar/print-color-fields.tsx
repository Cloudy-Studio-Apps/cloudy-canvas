import { FileUp } from "lucide-react";

import { Button, SelectField } from "@shared/ui/kit";
import type { BrochureColorMode } from "../../brochure";
import { useBrochure } from "../hooks/use-brochure";
import { useLoadPrintProfile } from "../hooks/use-load-print-profile";
import { t } from "../../catalog.i18n";

const COLOR_MODES = [
  { value: "rgb", label: t("print.colorRgb") },
  { value: "cmyk", label: t("print.colorCmyk") },
] as const;
const INTENTS = [
  { value: "relative", label: t("print.intentRelative") },
  { value: "perceptual", label: t("print.intentPerceptual") },
] as const;

/** The PDF's colors: RGB for screens, or CMYK through the print shop's profile. */
export function PrintColorFields() {
  const { brochure, settings } = useBrochure();
  const loadProfile = useLoadPrintProfile();
  const { colorMode, printProfile, renderingIntent } = settings;
  return (
    <>
      <SelectField<BrochureColorMode>
        label={t("print.color")}
        value={colorMode}
        options={COLOR_MODES}
        onChange={(mode) => brochure?.setSettings({ colorMode: mode })}
      />
      {colorMode === "cmyk" && (
        <>
          <p className="truncate text-xs text-muted-foreground" title={printProfile?.name}>
            {printProfile?.name ?? t("print.noProfileYet")}
          </p>
          <Button variant="secondary" size="sm" onClick={() => void loadProfile()}>
            <FileUp />
            {printProfile ? t("print.changeProfile") : t("print.loadProfile")}
          </Button>
          <SelectField
            label={t("print.intent")}
            value={renderingIntent}
            options={INTENTS}
            onChange={(intent) => brochure?.setSettings({ renderingIntent: intent })}
          />
        </>
      )}
    </>
  );
}
