import { BookOpen } from "lucide-react";

import { defineDesignMode } from "@design/ui/modules";
import {
  CATALOG_ALLOWED_COMMANDS,
  CATALOG_COMMANDS,
  CATALOG_MODE_ID,
  CATALOG_PICK_TOOL,
  CATALOG_TOOL,
  CatalogPickTool,
  CatalogTool,
} from "./mode";
import { catalogFaded } from "./mode/catalog-faded";
import { isPageFrame } from "./model";
import { BrochureTab } from "./ui/brochure-tab/brochure-tab";
import { BrochureCanvasLayer } from "./ui/canvas/brochure-canvas-layer";
import { useArrangeGlide } from "./ui/hooks/use-arrange-glide";
import { useArrangeOnEnter } from "./ui/hooks/use-arrange-on-enter";
import { useExportCommand } from "./ui/hooks/use-export-command";
import { BrochurePreview } from "./ui/preview/brochure-preview";
import { CatalogSidebar } from "./ui/sidebar/catalog-sidebar";
import { useBrochurePreviewStore } from "./ui/stores/preview-store";
import { useCatalogToolbarItems } from "./ui/toolbar/use-catalog-toolbar-items";

/**
 * The Catalog mode: a design's frames as a brochure's pages. Only top-level frames can be pointed
 * at (a click inside one reaches the frame); what isn't printed is dimmed; the select-only tool,
 * the hand and the pick tool work, and only the commands that organize run. While it's on: the
 * Brochure tab, the sidebar, the page badges, the toolbar and the preview (closed on leaving).
 */
export const catalogMode = defineDesignMode({
  id: CATALOG_MODE_ID,
  label: "Catalog",
  description: "Arrange frames into a print brochure: order, options, checks and PDF.",
  icon: BookOpen,
  order: 10,
  tool: CATALOG_TOOL,
  tools: [
    { id: CATALOG_TOOL, create: (ctx) => new CatalogTool(ctx) },
    { id: CATALOG_PICK_TOOL, create: (ctx) => new CatalogPickTool(ctx) },
  ],
  allowTools: ["hand"],
  isolate: isPageFrame,
  faded: catalogFaded,
  commands: CATALOG_ALLOWED_COMMANDS,
  hostCommands: [
    {
      id: CATALOG_COMMANDS.pick,
      label: "Pick the brochure's frames",
      run: (engine) => engine.setTool(CATALOG_PICK_TOOL),
    },
    {
      id: CATALOG_COMMANDS.preview,
      label: "Preview the brochure",
      run: () => useBrochurePreviewStore.getState().open(),
    },
    // Run by `useExportCommand`, which needs the file's name.
    { id: CATALOG_COMMANDS.exportPdf, label: "Export the brochure as PDF" },
  ],
  toolbar: { useItems: useCatalogToolbarItems },
  rail: { tabs: [{ id: "brochure", label: "Brochure", icon: BookOpen, component: BrochureTab }] },
  sidebar: CatalogSidebar,
  overlays: [BrochureCanvasLayer, BrochurePreview],
  onLeave: () => useBrochurePreviewStore.getState().close(),
  hooks: [useExportCommand, useArrangeGlide, useArrangeOnEnter],
});
