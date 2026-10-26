import { BookOpen, FileDown, LayoutGrid, ListChecks, MousePointer2, Play } from "lucide-react";

import {
  CATALOG_COMMANDS,
  CATALOG_PICK_TOOL,
  CATALOG_TOOL,
} from "../../mode/catalog-mode.constants";
import { ModeToolbar } from "@canvas-ui";
import { useBrochure } from "../hooks/use-brochure";

/**
 * The Catalog mode's toolbar (its `modes` entry's, in place of the main one): selecting pages,
 * the hand, picking frames, arranging them, the preview, the PDF and Done.
 */
export function CatalogModeToolbar() {
  const { brochure, pages } = useBrochure();
  const empty = pages.length === 0;
  return (
    <ModeToolbar
      title={{ label: "Catalog", icon: BookOpen }}
      label="Catalog mode"
      items={[
        {
          tool: CATALOG_TOOL,
          label: "Select pages",
          description: "Click pages to see them; they don't move here.",
          icon: MousePointer2,
        },
        { tool: "hand" },
        "divider",
        {
          command: CATALOG_COMMANDS.pick,
          label: "Pick frames",
          description: "Tick the frames the brochure prints.",
          icon: ListChecks,
          activeWhen: { tool: CATALOG_PICK_TOOL },
        },
        {
          run: () => brochure?.arrange(),
          label: "Arrange pages and options",
          description:
            "Lay the pages out on one line by spread, with their options as the brochure's Arrange setting says (below them while it's off).",
          icon: LayoutGrid,
          disabled: empty,
        },
        {
          command: CATALOG_COMMANDS.preview,
          label: "Preview",
          description: "Flip through the brochure.",
          icon: Play,
          disabled: empty,
        },
        {
          command: CATALOG_COMMANDS.exportPdf,
          label: "Export PDF",
          description: "The whole brochure as one PDF.",
          icon: FileDown,
          disabled: empty,
        },
      ]}
    />
  );
}
