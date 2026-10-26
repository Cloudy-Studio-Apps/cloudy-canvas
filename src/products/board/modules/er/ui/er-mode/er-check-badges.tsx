import { useMemo, useReducer, useEffect } from "react";
import { CircleX, TriangleAlert } from "lucide-react";

import { ER_MODE_ID } from "../../mode/er-mode";
import type { ErIssue } from "../../model/check/check-er.types";
import { useEngine, useEngineState } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import { useErModel, useErVersion } from "../model";
import type { ErShapeFindings } from "./er-check-badges.types";

/**
 * While the ER mode is on, a badge at the top-right corner of each shape the Check diagram has an
 * error or warning about (every diagram on the board); hovering lists them, a click selects the
 * shape. The badges follow the view.
 */
export function ErCheckBadges() {
  const engine = useEngine();
  const er = useErModel();
  const version = useErVersion();
  const inMode = useEngineState((state) => state.mode === ER_MODE_ID);
  const [, redraw] = useReducer((n: number) => n + 1, 0);

  useEffect(() => (inMode ? engine.onViewChange(redraw) : undefined), [engine, inMode]);

  const findings = useMemo(
    () => (inMode ? byShape(er.diagrams().flatMap((d) => er.diagram(d.id).check())) : []),
    // The version re-reads the diagrams when any ER shape changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [er, inMode, version],
  );
  if (!inMode) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {findings.map((finding) => {
        const el = engine.getElement(finding.shapeId);
        if (!el) return null;
        const box = engine.worldRectToScreen({ x: el.x, y: el.y, w: el.w, h: el.h });
        const Icon = finding.severity === "error" ? CircleX : TriangleAlert;
        return (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a finding badge laid over the canvas
          <button
            key={finding.shapeId}
            type="button"
            title={finding.messages.join("\n")}
            aria-label={finding.messages.join(" ")}
            className={cn(
              "pointer-events-auto absolute flex size-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm bg-surface shadow-soft",
              finding.severity === "error" ? "text-destructive" : "text-warning",
            )}
            style={{ left: box.x + box.w, top: box.y }}
            onClick={() => engine.focusElement(finding.shapeId)}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}

/** Errors and warnings grouped by shape, each with the worst severity. */
function byShape(issues: readonly ErIssue[]): ErShapeFindings[] {
  const map = new Map<string, ErShapeFindings>();
  for (const issue of issues) {
    if (issue.severity === "info") continue;
    const found = map.get(issue.shapeId);
    if (!found) {
      map.set(issue.shapeId, {
        shapeId: issue.shapeId,
        severity: issue.severity,
        messages: [issue.message],
      });
      continue;
    }
    found.messages.push(issue.message);
    if (issue.severity === "error") found.severity = "error";
  }
  return [...map.values()];
}
