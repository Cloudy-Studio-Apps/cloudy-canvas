import { Plus } from "lucide-react";

import { DESIGN_BROCHURE } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/components/ui/button";
import { useBrochure } from "../hooks/use-brochure";
import type { AddFrameBarProps } from "./canvas.types";

/** On a greyed frame under the pointer: make it a page, or an option of a page. */
export function AddFrameBar({ rect, frame, target }: AddFrameBarProps) {
  const engine = useDesignEngine();
  const brochure = engine.service(DESIGN_BROCHURE);
  const { label } = useBrochure();
  return (
    <div
      className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 gap-1"
      style={{ left: rect.x + rect.w / 2, top: rect.y + rect.h / 2 }}
    >
      <Button size="sm" className="shadow-lifted" onClick={() => brochure.addPages([frame.id])}>
        <Plus />
        Page
      </Button>
      {target && (
        <Button
          size="sm"
          variant="outline"
          className="shadow-lifted"
          onClick={() => brochure.addOption(target.slot.id, frame.id)}
        >
          <Plus />
          Option of page {label(target)}
        </Button>
      )}
    </div>
  );
}
