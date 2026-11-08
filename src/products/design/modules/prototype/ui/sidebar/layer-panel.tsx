import { Square } from "lucide-react";

import { isDesignNode } from "../../../core";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { t } from "../../prototype.i18n";
import { InteractionsSection } from "./interactions-section";
import type { LayerPanelProps } from "./layer-panel.types";

/** The Prototype panel of a selected layer: its name and screen, then its interactions. */
export function LayerPanel({ id, screen }: LayerPanelProps) {
  const engine = useDesignEngine();
  // Read again with the document, so a rename shows.
  usePrototypePage();
  const layer = engine.doc.get(id);
  const owner = engine.doc.get(screen);
  return (
    <>
      <div className="flex flex-col gap-0.5 border-b px-3 py-2.5">
        <strong className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Square className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{layer && isDesignNode(layer) ? layer.name : ""}</span>
        </strong>
        <span className="text-xs text-muted-foreground">
          {t("layer.in", { screen: owner && isDesignNode(owner) ? owner.name : "" })}
        </span>
      </div>
      <InteractionsSection owner={id} />
    </>
  );
}
