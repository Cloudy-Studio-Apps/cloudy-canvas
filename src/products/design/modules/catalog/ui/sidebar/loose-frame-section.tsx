import { DESIGN_BROCHURE } from "@design";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/components/ui/button";
import { useBrochure } from "../hooks/use-brochure";
import type { LooseFrameSectionProps } from "./sidebar.types";

/** A selected frame that isn't in the brochure: add it as a page, or as an option of the last one. */
export function LooseFrameSection({ frame }: LooseFrameSectionProps) {
  const engine = useDesignEngine();
  const { pages } = useBrochure();
  const brochure = engine.service(DESIGN_BROCHURE);
  const last = pages.at(-1);

  return (
    <PanelSection title="Not in the brochure">
      <p className="truncate text-sm text-foreground">{frame.name}</p>
      <p className="text-xs text-muted-foreground">
        Greyed frames stay in the design; they just aren't printed.
      </p>
      <div className="mt-2.5 flex flex-col gap-1.5">
        <Button size="sm" onClick={() => brochure.addPages([frame.id])}>
          Add as page {pages.length + 1}
        </Button>
        {last && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => brochure.addOption(last.slot.id, frame.id)}
          >
            Add as an option of page {last.number}
          </Button>
        )}
      </div>
    </PanelSection>
  );
}
