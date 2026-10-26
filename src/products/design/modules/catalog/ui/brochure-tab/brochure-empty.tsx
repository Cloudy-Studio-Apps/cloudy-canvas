import { ListChecks } from "lucide-react";

import { CATALOG_PICK_TOOL } from "../../mode/catalog-mode.constants";
import { findPreset } from "../../../frame";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/components/ui/button";
import { addBlankPage } from "../page-actions";

/** A4 in points (the paper frame preset's size), for a catalog started from nothing. */
const A4 = findPreset("a4")?.size ?? { w: 595, h: 842 };

/**
 * The brochure with no pages yet: pick the design's frames, or start with a blank A4 page (for a
 * catalog made from scratch).
 */
export function BrochureEmpty() {
  const engine = useDesignEngine();
  return (
    <div className="m-3 rounded-card border border-dashed border-border-strong p-4 text-center text-xs text-muted-foreground">
      <p className="mb-1 text-sm font-medium text-foreground">No pages yet</p>
      <p>
        Pick the frames this brochure prints. They go in the order you read the canvas: rows, left
        to right.
      </p>
      <Button size="sm" className="mt-3 w-full" onClick={() => engine.setTool(CATALOG_PICK_TOOL)}>
        <ListChecks />
        Pick frames
      </Button>
      <p className="mt-4 mb-1.5">Or start with a blank page:</p>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => addBlankPage(engine, A4, "A4")}
        >
          A4 portrait
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => addBlankPage(engine, { w: A4.h, h: A4.w }, "A4 landscape")}
        >
          A4 landscape
        </Button>
      </div>
    </div>
  );
}
