import type { CanvasElement } from "@canvas";
import { Zap } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { PanelSection } from "@design/ui/components/panel";
import { useService } from "@canvas-ui";
import { ListRow } from "@shared/ui/kit";
import { isDesignNode } from "../../../core";
import { DESIGN_PROTOTYPE, screenOf } from "../../model";
import { t } from "../../prototype.i18n";
import { usePrototypePage } from "../hooks/use-prototype-page";
import type { LinksToScreenProps } from "./links-to-screen.types";

const nameOf = (el: CanvasElement | null | undefined): string =>
  el && isDesignNode(el) ? el.name : "";

/** The layers (and screens) with an interaction showing this screen; a click selects one. */
export function LinksToScreen({ id }: LinksToScreenProps) {
  const engine = useDesignEngine();
  const prototype = useService(DESIGN_PROTOTYPE);
  // Read again with the document.
  usePrototypePage();
  const ids = prototype.linksTo(id);
  return (
    <PanelSection title={t("links.title")}>
      {ids.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("links.empty")}</p>
      ) : (
        <div className="flex flex-col">
          {ids.map((linkId) => (
            <ListRow
              key={linkId}
              size="sm"
              icon={<Zap />}
              label={nameOf(engine.doc.get(linkId))}
              meta={nameOf(screenOf(engine.doc, linkId))}
              onSelect={() => engine.select([linkId])}
            />
          ))}
        </div>
      )}
    </PanelSection>
  );
}
