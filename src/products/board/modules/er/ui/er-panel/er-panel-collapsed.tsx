import { ChevronsLeft, Network } from "lucide-react";

import { FloatingPanel } from "@canvas-ui";
import { useErDiagram, useErQuery } from "../model";
import type { ErPanelCollapsedProps } from "./er-panel-collapsed.types";

/**
 * The ER panel folded in the ER mode: the shown diagram's name and the Check diagram's count, as
 * one button that opens the panel again.
 */
export function ErPanelCollapsed({ onExpand }: ErPanelCollapsedProps) {
  const diagram = useErDiagram();
  const label = useErQuery((d, er) => er.diagrams().find((x) => x.id === d.id)?.label ?? "");
  const findings = useErQuery((d) =>
    d.id ? d.check().filter((issue) => issue.severity !== "info").length : 0,
  );
  return (
    <FloatingPanel role="complementary" aria-label="ER diagram editor (collapsed)">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm outline-none hover:bg-hover focus-visible:bg-hover"
        title="Open the ER panel"
        onClick={onExpand}
      >
        <ChevronsLeft className="size-4" />
        <Network className="size-4" />
        <span className="max-w-40 truncate font-medium">{diagram.id ? label : "ER diagram"}</span>
        {findings > 0 && (
          <span className="rounded-sm bg-warning px-1 text-[11px] leading-4 font-semibold text-surface">
            {findings}
          </span>
        )}
      </button>
    </FloatingPanel>
  );
}
