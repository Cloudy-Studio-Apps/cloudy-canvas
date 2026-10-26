import { FileDown, Play } from "lucide-react";

import { CATALOG_COMMANDS, CATALOG_PICK_TOOL } from "../../mode/catalog-mode.constants";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { BrochureChecksSection } from "./brochure-checks-section";
import { BrochureSettingsSection } from "./brochure-settings-section";
import { FramesSection } from "./frames-section";
import { LooseFrameSection } from "./loose-frame-section";
import { PageImagesSection } from "./page-images-section";
import { PageSection } from "./page-section";
import { PickSection } from "./pick-section";

/**
 * The properties panel in the Catalog mode (its `modeSidebars` entry): while picking, how to; a
 * selected page with its options and pictures; a frame that isn't in it; several frames; or the
 * brochure itself (settings, checks, preview and export).
 */
export function CatalogSidebar() {
  const engine = useDesignEngine();
  const picking = useDesignState((state) => state.tool === CATALOG_PICK_TOOL);
  const selection = useCatalogSelection();
  const { brochure, pages } = useBrochure();

  if (picking) return <PickSection />;
  if (selection.kind === "page") {
    return (
      <>
        <PageSection page={selection.page} />
        <PageImagesSection frame={selection.frame} />
      </>
    );
  }
  if (selection.kind === "loose") return <LooseFrameSection frame={selection.frame} />;
  if (selection.kind === "several") return <FramesSection frames={selection.frames} />;
  if (!brochure) {
    return (
      <p className="px-3 py-2.5 text-xs text-muted-foreground">
        This page has no brochure yet. Create one in the Brochure tab, or pick frames.
      </p>
    );
  }
  return (
    <>
      <BrochureSettingsSection />
      <BrochureChecksSection />
      {pages.length > 0 && (
        <div className="flex flex-col gap-1.5 px-3 py-2.5">
          <Button size="sm" onClick={() => engine.runHostAction(CATALOG_COMMANDS.exportPdf)}>
            <FileDown />
            Export PDF · {pages.length} pages
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => engine.runHostAction(CATALOG_COMMANDS.preview)}
          >
            <Play />
            Preview
          </Button>
        </div>
      )}
    </>
  );
}
