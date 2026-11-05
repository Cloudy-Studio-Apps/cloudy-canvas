import { useEffect } from "react";

import { useService } from "@canvas-ui";
import { toast } from "@shared/stores/toast-store";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import { UnreadableCopyError } from "../../model/repeats/unreadable-copy-error";
import { t } from "../../catalog.i18n";

/** Says why a tool's edit of a brochure was refused (`DesignBrochures.refused`), in a toast. */
export function useRefusedToast(): void {
  const brochures = useService(DESIGN_BROCHURES);
  useEffect(
    () =>
      brochures.onRefused((error) => {
        if (error instanceof UnreadableCopyError) toast({ title: t("repeat.unreadable") });
      }),
    [brochures],
  );
}
