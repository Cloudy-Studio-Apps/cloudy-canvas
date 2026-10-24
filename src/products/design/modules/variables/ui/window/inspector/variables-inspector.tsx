import { NumberScalePanel } from "../generator/number-scale-panel";
import { ShadeGeneratorPanel } from "../generator/shade-generator-panel";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { ModesInspector } from "./modes-inspector";
import { VariableInspector } from "./variable-inspector";

/** The window's right column: a generator or scale while one is set up, the picked variable, or modes. */
export function VariablesInspector() {
  const { store } = useBoard();
  const { draft, scaleDraft, selectedId } = useVariablesWindowStore();
  const variable = selectedId ? store.variable(selectedId) : undefined;
  return (
    <aside className="min-h-0 overflow-y-auto border-l border-border p-4">
      {draft ? (
        <ShadeGeneratorPanel draft={draft} />
      ) : scaleDraft ? (
        <NumberScalePanel draft={scaleDraft} />
      ) : variable ? (
        <VariableInspector key={variable.id} variable={variable} />
      ) : (
        <ModesInspector />
      )}
    </aside>
  );
}
