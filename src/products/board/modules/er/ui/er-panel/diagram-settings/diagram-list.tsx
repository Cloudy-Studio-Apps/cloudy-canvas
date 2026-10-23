import { Network, Plus } from "lucide-react";

import { rectCenter } from "@canvas";
import { useEngine } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErModel, useErQuery } from "../../model";
import { diagramShapeIds } from "../diagram-shape-ids";

/**
 * The board's ER diagrams, for when the panel shows none: each with its entity count and the
 * Check diagram's errors and warnings. Picking one shows its settings and fits it in the view.
 */
export function ErDiagramList() {
  const engine = useEngine();
  const er = useErModel();
  const setDiagram = useBoardPanelStore((state) => state.setErDiagram);
  const diagrams = useErQuery((_, model) =>
    model.diagrams().map((d) => ({
      ...d,
      findings: model
        .diagram(d.id)
        .check()
        .filter((issue) => issue.severity !== "info").length,
    })),
  );

  const show = (id: string) => {
    // Fit the diagram, then let go of it, so the panel shows its settings, not a shape's form.
    engine.select(diagramShapeIds(er.diagram(id).shapes()));
    engine.zoomToSelection();
    engine.select([]);
    setDiagram(id);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {diagrams.length > 0
          ? "Pick a diagram to see its settings, or select one of its shapes on the board."
          : "This board has no ER diagram yet."}
      </p>
      {diagrams.length > 0 && (
        <ul className="divide-y rounded-md border border-border">
          {diagrams.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm outline-none hover:bg-hover focus-visible:bg-hover"
                onClick={() => show(d.id)}
              >
                <Network className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">{d.label}</span>
                <span className="text-xs text-muted-foreground">
                  {d.entityCount} {d.entityCount === 1 ? "entity" : "entities"}
                </span>
                {d.findings > 0 && (
                  <span className="rounded-sm bg-warning px-1 text-[11px] leading-4 font-semibold text-surface">
                    {d.findings}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => {
          const id = er.newDiagram(rectCenter(engine.visibleWorldRect()));
          const diagram = er.diagramOf(id);
          engine.focusElement(id);
          if (diagram) setDiagram(diagram);
        }}
      >
        <Plus />
        New diagram
      </Button>
    </div>
  );
}
