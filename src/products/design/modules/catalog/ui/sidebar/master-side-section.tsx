import { PenLine } from "lucide-react";

import { isPageFrame } from "../../model/page-frame";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { editInDesign, showPage } from "../page-actions";
import type { MasterSideSectionProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/**
 * A selected master frame: which pages it's for, what goes on it, designing it, showing its
 * other side, and taking the master out of the brochure.
 */
export function MasterSideSection({ master, side }: MasterSideSectionProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const frameOf = (id: string | null) => {
    const el = id === null ? undefined : engine.doc.get(id);
    return isPageFrame(el) ? el : undefined;
  };
  const frame = frameOf(side === "left" ? master.left : master.right);
  const other = frameOf(side === "left" ? master.right : master.left);

  return (
    <>
      <PanelSection title={t(`masters.sideTitle.${side}`, { name: master.name })}>
        <p className="text-xs text-muted-foreground">
          {t("masters.sideBody", { name: master.name })}
        </p>
      </PanelSection>
      <div className="flex flex-col gap-1.5 border-b px-3 py-2.5">
        {frame && (
          <Button size="sm" variant="outline" onClick={() => editInDesign(engine, frame)}>
            <PenLine />
            {t("masters.edit")}
          </Button>
        )}
        {other && (
          <Button size="sm" variant="ghost" onClick={() => showPage(engine, other)}>
            {side === "left" ? t("masters.showRight") : t("masters.showLeft")}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => brochure?.masters.remove(master.id)}>
          {t("masters.remove")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("masters.removeHint")}</p>
      </div>
    </>
  );
}
