import { Play } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { pickFlow } from "../pick-flow";
import type { FlowFlagProps } from "./link-path.types";
import { t } from "../../prototype.i18n";

/** A chip above a flow's starting screen ("▶ Order coffee"); a click picks the flow. */
export function FlowFlag({ rect, flow }: FlowFlagProps) {
  const engine = useDesignEngine();
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a canvas chip sized to its label
    <button
      type="button"
      title={t("canvas.flagTitle", { name: flow.name })}
      className="pointer-events-auto absolute flex h-5 max-w-48 cursor-pointer items-center gap-1 rounded-md bg-primary px-1.5 text-[11px] font-semibold whitespace-nowrap text-primary-foreground"
      style={{ left: rect.x, top: rect.y - 24 }}
      onClick={() => pickFlow(engine, flow.id)}
    >
      <Play className="size-[11px] shrink-0 fill-current" />
      <span className="truncate">{flow.name}</span>
    </button>
  );
}
