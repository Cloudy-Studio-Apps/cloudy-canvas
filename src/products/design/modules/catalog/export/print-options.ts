import type { PdfExportOptions, PdfPrintColor } from "@canvas";

import type { BrochureSettings } from "../brochure";
import { t } from "../catalog.i18n";
import { mmToUnits } from "../model";

/** The PDF a brochure's settings ask for, the one place that reads them for it. */
export function printOptions(
  settings: BrochureSettings,
  asset: (id: string) => Uint8Array | undefined,
): Partial<PdfExportOptions> {
  return {
    mode: settings.pdfMode,
    dpi: settings.dpi,
    pointsPerUnit: 1,
    print: {
      bleed: mmToUnits(settings.bleed),
      marks: settings.cropMarks,
      color: printColor(settings, asset),
    },
  };
}

function printColor(
  { colorMode, printProfile, renderingIntent }: BrochureSettings,
  asset: (id: string) => Uint8Array | undefined,
): PdfPrintColor | null {
  if (colorMode === "rgb") return null;
  const profile = printProfile && asset(printProfile.assetId);
  if (!profile) throw new Error(t("print.noProfile"));
  return { profile, intent: renderingIntent };
}
