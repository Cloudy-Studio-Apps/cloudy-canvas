import { BoxSelect, FileCode, LayoutGrid, ListChecks, Plus, Table2 } from "lucide-react";

import { rectCenter } from "@canvas";
import { useEngine, type ModeToolbarEntry } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErDiagram, useErModel, useErQuery } from "../model";
import { diagramShapeIds } from "../er-panel/diagram-shape-ids";
import { useErToTablesStore } from "../er-to-tables";

/**
 * The ER mode's toolbar items: a new diagram, selecting and re-laying out the shown one, its
 * text, its check (with the number of errors and warnings) and its tables. The element types are
 * in the palette at the left edge.
 */
export function useErToolbarItems(): readonly ModeToolbarEntry[] {
  const engine = useEngine();
  const er = useErModel();
  const diagram = useErDiagram();
  const setOpen = useBoardPanelStore((state) => state.setErOpen);
  const setTab = useBoardPanelStore((state) => state.setErTab);
  const findings = useErQuery((d) => d.check().filter((issue) => issue.severity !== "info").length);
  const none = !diagram.id;
  const openPanel = (tab: "visual" | "text") => {
    setOpen(true);
    useBoardPanelStore.getState().setErCollapsed(false);
    setTab(tab);
  };

  return [
    {
      run: () => engine.focusElement(er.newDiagram(rectCenter(engine.visibleWorldRect()))),
      label: "New diagram",
      description: "Start another diagram in the middle of the view.",
      icon: Plus,
    },
    {
      run: () => engine.select(diagramShapeIds(diagram.shapes())),
      label: "Select diagram",
      description: "Select the whole shown diagram, to move it.",
      icon: BoxSelect,
      disabled: none,
    },
    {
      run: () => diagram.relayout(),
      label: "Re-layout",
      description: "Lay the shown diagram out again.",
      icon: LayoutGrid,
      disabled: none,
    },
    {
      run: () => openPanel("text"),
      label: "Diagram text",
      description: "Edit the shown diagram as text in the ER panel.",
      icon: FileCode,
    },
    {
      run: () => {
        engine.select([]);
        openPanel("visual");
      },
      label: findings ? `Check diagram (${findings})` : "Check diagram",
      description: "The diagram's standard and what breaks its rules, in the ER panel.",
      icon: ListChecks,
      disabled: none,
      badge: findings,
    },
    {
      run: () => useErToTablesStore.getState().open(diagram.id),
      label: "Create tables",
      description: "Turn the shown diagram into database tables.",
      icon: Table2,
      disabled: none,
    },
  ];
}
