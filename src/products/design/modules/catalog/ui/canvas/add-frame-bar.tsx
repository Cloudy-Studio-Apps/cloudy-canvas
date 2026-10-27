import { Plus } from "lucide-react";

import { ensureBrochure } from "../../model/current-brochure";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import type { AddFrameBarProps } from "./canvas.types";
import { t } from "../../catalog.i18n";

/** On a greyed frame under the pointer: make it a page, or an option of a page. */
export function AddFrameBar({ rect, frame, target }: AddFrameBarProps) {
  const engine = useDesignEngine();
  const { label } = useBrochure();
  return (
    <div
      className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 gap-1"
      style={{ left: rect.x + rect.w / 2, top: rect.y + rect.h / 2 }}
    >
      <Button
        size="sm"
        className="shadow-lifted"
        onClick={() => ensureBrochure(engine).addPages([frame.id])}
      >
        <Plus />
        {t("canvas.page")}
      </Button>
      {target && (
        <Button
          size="sm"
          variant="outline"
          className="shadow-lifted"
          onClick={() => ensureBrochure(engine).addOption(target.slot.id, frame.id)}
        >
          <Plus />
          {t("canvas.optionOfPage", { page: label(target) })}
        </Button>
      )}
    </div>
  );
}
