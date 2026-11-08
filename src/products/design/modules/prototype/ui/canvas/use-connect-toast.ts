import { useEffect } from "react";
import type { CanvasElement } from "@canvas";

import { useService } from "@canvas-ui";
import { toast } from "@shared/stores/toast-store";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { isDesignNode } from "../../../core";
import { CONNECT_DRAG } from "../../mode";
import { t } from "../../prototype.i18n";

const nameOf = (el: CanvasElement | null | undefined): string =>
  el && isDesignNode(el) ? el.name : "";

/** Says what a dropped link added: "Linked “Start order” to Menu", "“Start order” now goes Back". */
export function useConnectToast(): void {
  const engine = useDesignEngine();
  const drag = useService(CONNECT_DRAG);
  useEffect(
    () =>
      drag.onChange(() => {
        const drop = drag.state() === null ? drag.lastDrop() : null;
        if (!drop) return;
        const layer = nameOf(engine.doc.get(drop.from));
        const title =
          drop.to === null
            ? t("connect.back", { layer })
            : t("connect.linked", { layer, screen: nameOf(engine.doc.get(drop.to)) });
        toast({ title });
      }),
    [engine, drag],
  );
}
