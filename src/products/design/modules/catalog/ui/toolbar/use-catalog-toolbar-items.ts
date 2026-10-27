import { FileDown, LayoutGrid, ListChecks, MousePointer2, Play } from "lucide-react";

import type { ModeToolbarEntry } from "@canvas-ui";
import {
  CATALOG_COMMANDS,
  CATALOG_PICK_TOOL,
  CATALOG_TOOL,
} from "../../mode/catalog-mode.constants";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

/**
 * The Catalog mode's toolbar items: selecting pages, the hand, picking frames, arranging them,
 * the preview and the PDF (the last three need pages).
 */
export function useCatalogToolbarItems(): readonly ModeToolbarEntry[] {
  const { brochure, pages } = useBrochure();
  const empty = pages.length === 0;
  return [
    {
      tool: CATALOG_TOOL,
      label: t("toolbar.selectPages"),
      description: t("toolbar.selectPagesHint"),
      icon: MousePointer2,
    },
    { tool: "hand" },
    "divider",
    {
      command: CATALOG_COMMANDS.pick,
      label: t("toolbar.pickFrames"),
      description: t("toolbar.pickFramesHint"),
      icon: ListChecks,
      activeWhen: { tool: CATALOG_PICK_TOOL },
    },
    {
      run: () => brochure?.arrange(),
      label: t("toolbar.arrange"),
      description: t("toolbar.arrangeHint"),
      icon: LayoutGrid,
      disabled: empty,
    },
    {
      command: CATALOG_COMMANDS.preview,
      label: t("toolbar.preview"),
      description: t("toolbar.previewHint"),
      icon: Play,
      disabled: empty,
    },
    {
      command: CATALOG_COMMANDS.exportPdf,
      label: t("toolbar.exportPdf"),
      description: t("toolbar.exportPdfHint"),
      icon: FileDown,
      disabled: empty,
    },
  ];
}
