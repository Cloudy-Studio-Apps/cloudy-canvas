import { defineModule } from "@shared/core";
import { registerDesignMode } from "@design/ui/modules";
import { designMcpTools, designCanvas, designMigrations } from "../../design-points";
import { BrochureKind } from "./brochure";
import { catalogMode } from "./catalog.mode";
import { catalogTools } from "./mcp";
import { editCatalogPage } from "./mode";
import { pruneBrochure, splitLegacyBrochure } from "./model";
import * as catalogApi from ".";

/**
 * Catalog: a design page's top-level frames as a print brochure's pages (the Catalog mode,
 * `catalog.mode.ts`; a page can hold several brochures). The brochure records, their pruning when
 * frames or pages are deleted and the migration of older files' single brochure, double-click to
 * design a page, and the agent tools.
 */
export const catalogModule = defineModule({
  id: "catalog",
  tier: "feature",
  requires: ["core", "pages", "frame"],
  // Replaces a page's pictures with image's `replaceImageFill`; `uses`, not `requires`: catalog loads
  // before image (its `editElement` takes frames first).
  uses: ["image"],
  exports: { ...catalogApi },
  register(host) {
    host.contribute(designCanvas.kinds, new BrochureKind());
    registerDesignMode(host, catalogMode);
    // Deleted frames leave the brochures, and a deleted page's brochures go, in the same undo step.
    host.contribute(designCanvas.onRemove, (doc, removed) => pruneBrochure(doc, removed));
    // One brochure per design, from before brochures belonged to a page, is split by page.
    host.contribute(designMigrations, { id: "catalog.brochures", migrate: splitLegacyBrochure });
    host.contribute(designCanvas.editElement, editCatalogPage);
    host.contribute(designMcpTools, { id: "catalog", tools: () => catalogTools });
  },
});
