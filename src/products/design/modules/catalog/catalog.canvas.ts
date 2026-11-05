import type { ModuleHost } from "@shared/core";
import { designCanvas, designMigrations } from "../../design-points";
import { dataLocaleProviders, dataPreviewSetters, dataScopeProviders } from "../data";
import { BrochureKind } from "./brochure";
import { editCatalogPage } from "./mode";
import {
  brochurePreviewSetter,
  pageLocaleProvider,
  pageScopeProvider,
  prepareItemCopies,
  prepareRepeatCopies,
  pruneBrochure,
  splitLegacyBrochure,
  syncBrochureRepeats,
  syncPageItems,
} from "./model";

/**
 * The catalog's canvas side: the brochure records, their pruning and migration, the syncs that
 * keep their pages (repeats' copies, masters and page items), what copying their copies does, the
 * loops and language data reads on their pages (and In scope's names and preview steppers for them), and double-click to design a page.
 */
export function registerCatalogCanvas(host: ModuleHost): void {
  host.contribute(designCanvas.kinds, new BrochureKind());
  // Deleted frames leave the brochures, and a deleted page's brochures go, in the same undo step.
  host.contribute(designCanvas.onRemove, (doc, removed) => pruneBrochure(doc, removed));
  // Repeating sections and pages make their copies first, so the masters are stamped on them.
  host.contribute(designCanvas.afterEdit, syncBrochureRepeats);
  // The pages show their masters and page items, kept up in every edit's undo step.
  host.contribute(designCanvas.afterEdit, (doc, change) => syncPageItems(doc, change));
  // Master copies copied with their page are left out; copied alone, they're freed.
  host.contribute(designCanvas.prepareCopies, prepareItemCopies);
  // A generated page pasted is an ordinary page.
  host.contribute(designCanvas.prepareCopies, prepareRepeatCopies);
  // A page's layers read the rows of the loops around it, in its brochure's language.
  host.contribute(dataScopeProviders, pageScopeProvider);
  host.contribute(dataLocaleProviders, pageLocaleProvider);
  // In scope names a section's or page's loop and steps its preview row from the template pages.
  host.contribute(dataPreviewSetters, brochurePreviewSetter);
  // One brochure per design, from before brochures belonged to a page, is split by page.
  host.contribute(designMigrations, { id: "catalog.brochures", migrate: splitLegacyBrochure });
  host.contribute(designCanvas.editElement, editCatalogPage);
}
