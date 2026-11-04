import { defineModule } from "@shared/core";
import { designEditor, registerDesignMode } from "@design/ui/modules";
import { designMcpTools, designCanvas, designMigrations } from "../../design-points";
import { designStarters } from "../core/ui";
import { BrochureKind } from "./brochure";
import { catalogMode } from "./catalog.mode";
import { catalogTools } from "./mcp";
import { editCatalogPage } from "./mode";
import { prepareItemCopies, pruneBrochure, splitLegacyBrochure, syncPageItems } from "./model";
import { pageItemTag } from "./model/page-items/page-item-fields";
import { FromMasterBadge } from "./ui/design-mode/from-master-badge";
import { FromMasterSection } from "./ui/design-mode/from-master-section";
import { a4BrochureStarter } from "./ui/starters/a4-brochure.starter";
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
  // Reads and sizes page items' texts with text's helpers.
  uses: ["image", "text"],
  exports: { ...catalogApi },
  register(host) {
    host.contribute(designCanvas.kinds, new BrochureKind());
    registerDesignMode(host, catalogMode);
    // Deleted frames leave the brochures, and a deleted page's brochures go, in the same undo step.
    host.contribute(designCanvas.onRemove, (doc, removed) => pruneBrochure(doc, removed));
    // One brochure per design, from before brochures belonged to a page, is split by page.
    // The pages show their masters and page items, kept up in every edit's undo step.
    host.contribute(designCanvas.afterEdit, (doc, change) => syncPageItems(doc, change));
    // Master copies copied with their page are left out; copied alone, they're freed.
    host.contribute(designCanvas.prepareCopies, prepareItemCopies);
    // In the Design mode they're marked, and say where they come from.
    host.contribute(designEditor.layerBadges, {
      id: "catalog.from-master",
      component: FromMasterBadge,
    });
    host.contribute(designEditor.propertySections, {
      id: "catalog.from-master",
      tab: "design",
      order: 1,
      when: ({ nodes }) => nodes.some((node) => pageItemTag(node)),
      component: FromMasterSection,
    });
    host.contribute(designMigrations, { id: "catalog.brochures", migrate: splitLegacyBrochure });
    host.contribute(designCanvas.editElement, editCatalogPage);
    host.contribute(designMcpTools, { id: "catalog", tools: () => catalogTools });
    host.contribute(designStarters, a4BrochureStarter);
  },
});
