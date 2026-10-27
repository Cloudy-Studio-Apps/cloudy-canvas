import { BoxSelect, FileCode, LayoutGrid, ListChecks, Plus, Table2 } from "lucide-react";

import { rectCenter } from "@canvas";
import { useEngine, type ModeToolbarEntry } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErDiagram, useErModel, useErQuery } from "../model";
import { diagramShapeIds } from "../er-panel/diagram-shape-ids";
import { useErToTablesStore } from "../er-to-tables";
import { t } from "../../er.i18n";

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
      label: t("toolbar.newDiagram"),
      description: t("toolbar.newDiagramHint"),
      icon: Plus,
    },
    {
      run: () => engine.select(diagramShapeIds(diagram.shapes())),
      label: t("toolbar.selectDiagram"),
      description: t("toolbar.selectDiagramHint"),
      icon: BoxSelect,
      disabled: none,
    },
    {
      run: () => diagram.relayout(),
      label: t("toolbar.relayout"),
      description: t("toolbar.relayoutHint"),
      icon: LayoutGrid,
      disabled: none,
    },
    {
      run: () => openPanel("text"),
      label: t("toolbar.text"),
      description: t("toolbar.textHint"),
      icon: FileCode,
    },
    {
      run: () => {
        engine.select([]);
        openPanel("visual");
      },
      label: findings ? t("toolbar.checkCount", { count: findings }) : t("toolbar.check"),
      description: t("toolbar.checkHint"),
      icon: ListChecks,
      disabled: none,
      badge: findings,
    },
    {
      run: () => useErToTablesStore.getState().open(diagram.id),
      label: t("toolbar.createTables"),
      description: t("toolbar.createTablesHint"),
      icon: Table2,
      disabled: none,
    },
  ];
}
