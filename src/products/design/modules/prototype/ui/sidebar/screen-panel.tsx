import { Frame } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { PanelSection } from "@design/ui/components/panel";
import { useService } from "@canvas-ui";
import { SwitchField } from "@shared/ui/kit";
import { isDesignNode } from "../../../core";
import { DESIGN_PROTOTYPE } from "../../model";
import { t } from "../../prototype.i18n";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { InteractionsSection } from "./interactions-section";
import { LinksToScreen } from "./links-to-screen";
import type { ScreenPanelProps } from "./screen-panel.types";

/** The Prototype panel of a selected screen: its flow start, its interactions, what links to it. */
export function ScreenPanel({ id }: ScreenPanelProps) {
  const engine = useDesignEngine();
  const prototype = useService(DESIGN_PROTOTYPE);
  const { page, flows } = usePrototypePage();
  const screen = engine.doc.get(id) ?? null;
  const flow = flows.find((candidate) => candidate.start === id);

  const setStart = (on: boolean) => {
    if (on && page !== null && !flow) prototype.addFlow(page, id);
    // Every flow starting here goes in one undo step.
    else if (!on) prototype.removeFlowsStartingAt(id);
  };

  return (
    <>
      <div className="flex flex-col gap-0.5 border-b px-3 py-2.5">
        <strong className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Frame className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{screen && isDesignNode(screen) ? screen.name : ""}</span>
        </strong>
        <span className="text-xs text-muted-foreground">{t("screen.kind")}</span>
      </div>
      <PanelSection title={t("screen.flowStart")}>
        <SwitchField
          label={flow ? t("screen.starts", { flow: flow.name }) : t("screen.startHere")}
          checked={flow !== undefined}
          onChange={setStart}
        />
      </PanelSection>
      <InteractionsSection owner={id} />
      <LinksToScreen id={id} />
    </>
  );
}
