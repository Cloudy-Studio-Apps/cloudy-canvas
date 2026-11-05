import { defineModule } from "@shared/core";
import { designEditor, registerDesignMode } from "@design/ui/modules";
import { designMcpTools } from "../../design-points";
import { designStarters } from "../core/ui";
import { catalogMode } from "./catalog.mode";
import { t } from "./catalog.i18n";
import { catalogTools } from "./mcp";
import { CATALOG_COMMANDS, CATALOG_MODE_ID } from "./mode";
import { CATALOG_TEXT_TEMPLATE, readPageRef } from "./model";
import { registerCatalogCanvas } from "./catalog.canvas";
import { pageItemTag, pageItemTemplate } from "./model/page-items/page-item-fields";
import { FromMasterBadge } from "./ui/design-mode/from-master-badge";
import { FromMasterSection } from "./ui/design-mode/from-master-section";
import { PageRefSection } from "./ui/design-mode/page-ref-section";
import { SectionParentsSection } from "./ui/design-mode/section-parents-section";
import { a4BrochureStarter } from "./ui/starters/a4-brochure.starter";
import { BUILT_IN_PAGE_ITEMS } from "./ui/page-items/built-in-page-items";
import { catalogPageItems } from "./ui/catalog.points";
import { textTemplates } from "../text";
import * as catalogApi from ".";
import * as catalogUi from "./ui";

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
  // Repeats sections and pages over data's rows (`repeatRows`, `layerScope`), fills its pages
  // (`syncDataFor`) and answers data's `dataScopeProviders`/`dataLocaleProviders` for them.
  uses: ["image", "text", "data"],
  exports: { ...catalogApi, ...catalogUi },
  register(host) {
    registerCatalogCanvas(host);
    registerDesignMode(host, catalogMode);
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
    // Page items that write the section say how many of its parents they write.
    host.contribute(designEditor.propertySections, {
      id: "catalog.section-parents",
      tab: "design",
      order: 2,
      when: ({ nodes }) =>
        nodes.some((node) => {
          const template = pageItemTemplate(node);
          return !pageItemTag(node) && template !== null && template.includes("{section");
        }),
      component: SectionParentsSection,
    });
    // A page reference picks the section or page it points to.
    host.contribute(designEditor.propertySections, {
      id: "catalog.page-ref",
      tab: "design",
      order: 3,
      when: ({ nodes }) =>
        nodes.length === 1 &&
        nodes.some((node) => {
          const template = pageItemTemplate(node);
          return !pageItemTag(node) && template !== null && readPageRef(template) !== null;
        }),
      component: PageRefSection,
    });
    // A page item's text is edited as its template, which the sync then reads for its page.
    host.contribute(textTemplates, CATALOG_TEXT_TEMPLATE);
    // Shift+Delete in the Catalog mode's menu, after its Delete (which takes pages out).
    host.contribute(designEditor.contextMenu, {
      id: "catalog.delete-pages",
      menu: "selection",
      modes: [CATALOG_MODE_ID],
      items: [
        {
          command: CATALOG_COMMANDS.deletePages,
          label: t("mode.deletePages"),
          destructive: true,
          enabled: ({ selectionCount }) => selectionCount > 0,
        },
      ],
    });
    host.contribute(designMcpTools, { id: "catalog", tools: () => catalogTools });
    host.contribute(designStarters, a4BrochureStarter);
    // The Page items list's built-ins (page number, title, …); plugins add their own.
    host.contribute(catalogPageItems, ...BUILT_IN_PAGE_ITEMS);
  },
});
