import {
  BookOpen,
  FileDown,
  Hand,
  LayoutGrid,
  ListChecks,
  MousePointer2,
  Play,
} from "lucide-react";

import { CATALOG_COMMANDS, CATALOG_PICK_TOOL, CATALOG_TOOL } from "@design";
import { FloatingPanel, PanelDivider, ToolButton, useEditorMode } from "@canvas-ui";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/components/ui/button";
import { useBrochure } from "../hooks/use-brochure";

/**
 * The Catalog mode's toolbar (its `modes` entry's, in place of the main one): selecting pages,
 * the hand, picking frames, arranging them, the preview, the PDF and Done.
 */
export function CatalogModeToolbar() {
  const engine = useDesignEngine();
  const mode = useEditorMode();
  const tool = useDesignState((state) => state.tool);
  const { brochure, pages: list } = useBrochure();
  const pages = list.length;

  return (
    <FloatingPanel role="toolbar" aria-label="Catalog mode" aria-orientation="horizontal">
      <span className="flex items-center gap-1.5 px-2 text-sm font-medium">
        <BookOpen className="size-4" />
        Catalog
      </span>
      <PanelDivider />
      <ToolButton
        label="Select pages"
        description="Click pages to see them; they don't move here."
        active={tool === CATALOG_TOOL}
        onClick={() => engine.setTool(CATALOG_TOOL)}
      >
        <MousePointer2 />
      </ToolButton>
      <ToolButton
        label="Hand"
        shortcut={engine.keymap.label("tool.hand")}
        active={tool === "hand"}
        onClick={() => engine.setTool("hand")}
      >
        <Hand />
      </ToolButton>
      <PanelDivider />
      <ToolButton
        label="Pick frames"
        description="Tick the frames the brochure prints."
        active={tool === CATALOG_PICK_TOOL}
        onClick={() => engine.runHostAction(CATALOG_COMMANDS.pick)}
      >
        <ListChecks />
      </ToolButton>
      <ToolButton
        label="Arrange pages and options"
        description="Lay the pages out on one line by spread, with their options as the brochure's Arrange setting says (below them while it's off)."
        disabled={pages === 0}
        onClick={() => brochure?.arrange()}
      >
        <LayoutGrid />
      </ToolButton>
      <ToolButton
        label="Preview"
        description="Flip through the brochure."
        disabled={pages === 0}
        onClick={() => engine.runHostAction(CATALOG_COMMANDS.preview)}
      >
        <Play />
      </ToolButton>
      <ToolButton
        label="Export PDF"
        description="The whole brochure as one PDF."
        disabled={pages === 0}
        onClick={() => engine.runHostAction(CATALOG_COMMANDS.exportPdf)}
      >
        <FileDown />
      </ToolButton>
      <PanelDivider />
      <Button size="sm" className="mx-1" onClick={mode.leave}>
        Done
      </Button>
    </FloatingPanel>
  );
}
