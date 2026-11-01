import type { PdfExportOptions } from "@canvas";

import type { BrochureSettings } from "../brochure";
import { mmToUnits } from "../model";

/** The PDF a brochure's settings ask for, the one place that reads them for it. */
export function printOptions(settings: BrochureSettings): Partial<PdfExportOptions> {
  return {
    mode: settings.pdfMode,
    dpi: settings.dpi,
    pointsPerUnit: 1,
    print: { bleed: mmToUnits(settings.bleed), marks: settings.cropMarks },
  };
}
