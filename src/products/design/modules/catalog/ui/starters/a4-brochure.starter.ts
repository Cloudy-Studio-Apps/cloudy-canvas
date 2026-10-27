import type { DesignStarter } from "../../../core/ui";
import { createPresetFrame, findPreset } from "../../../frame";
import { CATALOG_MODE_ID } from "../../mode/catalog-mode.constants";
import { DESIGN_BROCHURES } from "../../model";
import { t } from "../../catalog.i18n";
import preview from "./a4-brochure.svg";

/** How many A4 pages the brochure starts with (a folded booklet's four sides). */
const PAGES = 4;

/** Home's "A4 brochure": a brochure of blank A4 pages, opened in the Catalog mode. */
export const a4BrochureStarter: DesignStarter = {
  id: "a4-brochure",
  label: t("starters.a4Brochure.label"),
  description: t("starters.a4Brochure.description"),
  preview,
  order: 30,
  start: (engine) => {
    const page = engine.scope;
    const a4 = findPreset("a4");
    if (page === null || !a4) return;
    const brochure = engine.service(DESIGN_BROCHURES).create(page);
    for (let i = 0; i < PAGES; i++) {
      brochure.addNewPage(createPresetFrame(a4, engine.doc, engine.elements()));
    }
    engine.setMode(CATALOG_MODE_ID);
  },
};
