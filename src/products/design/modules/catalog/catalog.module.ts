import { BookOpen } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designAgentTools, designCanvas, designMigrations } from "../../design-points";
import { BrochureKind } from "./brochure";
import { catalogTools } from "./agent";
import {
  CATALOG_COMMANDS,
  CATALOG_MODE,
  CATALOG_MODE_ID,
  CATALOG_PICK_TOOL,
  CATALOG_TOOL,
  CatalogPickTool,
  CatalogTool,
  editCatalogPage,
} from "./mode";
import { pruneBrochure, splitLegacyBrochure } from "./model";
import { BrochureTab } from "./ui/brochure-tab/brochure-tab";
import { BrochureOverlay } from "./ui/canvas/brochure-overlay";
import { useArrangeGlide } from "./ui/hooks/use-arrange-glide";
import { useArrangeOnEnter } from "./ui/hooks/use-arrange-on-enter";
import { useCatalogCommands } from "./ui/hooks/use-catalog-commands";
import { BrochurePreview } from "./ui/preview/brochure-preview";
import { CatalogSidebar } from "./ui/sidebar/catalog-sidebar";
import { CatalogModeToolbar } from "./ui/toolbar/catalog-mode-toolbar";

/**
 * Catalog: a design page's top-level frames as a print brochure's pages (the Catalog mode; a page
 * can hold several brochures). The brochure records, their pruning when frames or pages are
 * deleted and the migration of older files' single brochure, the mode with its select-only and pick
 * tools, double-click to design a page, the agent tools, and while the mode is on: the Brochure
 * tab, the sidebar (settings, checks, the page's options and pictures), the page badges over the
 * canvas, the toolbar, the preview and the PDF export.
 */
export const catalogModule = defineModule({
  id: "catalog",
  requires: ["core", "pages", "frame"],
  register(host) {
    host.contribute(designCanvas.kinds, new BrochureKind());
    host.contribute(designCanvas.modes, CATALOG_MODE);
    host.contribute(
      designCanvas.tools,
      { id: CATALOG_TOOL, create: (ctx) => new CatalogTool(ctx) },
      { id: CATALOG_PICK_TOOL, create: (ctx) => new CatalogPickTool(ctx) },
    );
    host.contribute(
      designCanvas.hostCommands,
      { id: CATALOG_COMMANDS.pick, label: "Pick the brochure's frames" },
      { id: CATALOG_COMMANDS.preview, label: "Preview the brochure" },
      { id: CATALOG_COMMANDS.exportPdf, label: "Export the brochure as PDF" },
    );
    // Deleted frames leave the brochures, and a deleted page's brochures go, in the same undo step.
    host.contribute(designCanvas.onRemove, (doc, removed) => pruneBrochure(doc, removed));
    // One brochure per design, from before brochures belonged to a page, is split by page.
    host.contribute(designMigrations, { id: "catalog.brochures", migrate: splitLegacyBrochure });
    host.contribute(designCanvas.editElement, editCatalogPage);
    host.contribute(designAgentTools, { id: "catalog", tools: () => catalogTools });

    host.contribute(designEditor.modes, {
      id: CATALOG_MODE_ID,
      label: "Catalog",
      description: "Arrange frames into a print brochure: order, options, checks and PDF.",
      icon: BookOpen,
      order: 10,
      toolbar: CatalogModeToolbar,
    });
    host.contribute(designEditor.leftTabs, {
      id: "brochure",
      label: "Brochure",
      icon: BookOpen,
      order: 10,
      modes: [CATALOG_MODE_ID],
      component: BrochureTab,
    });
    host.contribute(designEditor.modeSidebars, {
      mode: CATALOG_MODE_ID,
      component: CatalogSidebar,
    });
    host.contribute(
      designEditor.overlays,
      { id: "catalog.pages", component: BrochureOverlay },
      { id: "catalog.preview", component: BrochurePreview },
    );
    host.contribute(designEditor.sessionHooks, { id: "catalog.commands", use: useCatalogCommands });
    host.contribute(designEditor.sessionHooks, {
      id: "catalog.arrange-glide",
      use: useArrangeGlide,
    });
    host.contribute(designEditor.sessionHooks, {
      id: "catalog.arrange-on-enter",
      use: useArrangeOnEnter,
    });
  },
});
