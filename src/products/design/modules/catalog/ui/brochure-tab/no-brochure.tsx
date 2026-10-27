import { BookPlus } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

/**
 * A design page without a brochure: make one. (Picking frames or adding a blank page from the
 * canvas or the toolbar makes one too.)
 */
export function NoBrochure() {
  const { brochures, scope } = useBrochure();
  return (
    <div className="m-3 rounded-card border border-dashed border-border-strong p-4 text-center text-xs text-muted-foreground">
      <p className="mb-1 text-sm font-medium text-foreground">{t("tab.noBrochure")}</p>
      <p>{t("tab.noBrochureHint")}</p>
      <Button
        size="sm"
        className="mt-3 w-full"
        disabled={scope === null}
        onClick={() => scope !== null && brochures.create(scope)}
      >
        <BookPlus />
        {t("tab.create")}
      </Button>
    </div>
  );
}
