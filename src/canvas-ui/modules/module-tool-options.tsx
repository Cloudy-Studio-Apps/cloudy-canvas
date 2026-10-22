import { useEngineState } from "../engine-context";
import { useEditorModules } from "./editor-modules-context";

/**
 * The options panel of the active tool, or with the select tool the panel of the selection's
 * element type (when it's all one type); nothing when there's none.
 */
export function ModuleToolOptions() {
  const { host, points } = useEditorModules();
  const tool = useEngineState((state) => state.tool);
  const selectionTypes = useEngineState((state) => state.selectionTypes);
  const Panel =
    host.find(points.toolPanels, tool)?.component ??
    (tool === "select" ? host.find(points.selectionPanels, selectionTypes)?.component : undefined);
  return Panel ? <Panel /> : null;
}
