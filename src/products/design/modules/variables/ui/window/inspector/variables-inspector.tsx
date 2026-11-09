import { TokenSourceHeader } from "@canvas-ui";
import { NumberScalePanel } from "../generator/number-scale-panel";
import { ShadeGeneratorPanel } from "../generator/shade-generator-panel";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { ModesInspector } from "./modes-inspector";
import type { VariableInspectorProps } from "./inspector.types";
import { VariableInspector } from "./variable-inspector";

/**
 * The window's right column: a generator or scale while one is set up, the picked variable (only
 * shown, every control off, for a library's that can't be edited), or modes.
 */
export function VariablesInspector() {
  const { store, canEdit } = useBoard();
  const { draft, scaleDraft, selectedId } = useVariablesWindowStore();
  const variable = selectedId ? store.variable(selectedId) : undefined;
  return (
    <aside className="min-h-0 overflow-y-auto border-l border-border p-4">
      {draft ? (
        <ShadeGeneratorPanel draft={draft} />
      ) : scaleDraft ? (
        <NumberScalePanel draft={scaleDraft} />
      ) : variable ? (
        canEdit(variable) ? (
          <VariableInspector key={variable.id} variable={variable} />
        ) : (
          <ReadOnlyVariable variable={variable} />
        )
      ) : (
        <ModesInspector />
      )}
    </aside>
  );
}

/** A library's variable while the library can't be edited: why, then its inspector, all disabled. */
function ReadOnlyVariable({ variable }: VariableInspectorProps) {
  const { source } = useBoard();
  return (
    <div className="flex flex-col gap-3">
      {source && <TokenSourceHeader source={source} />}
      <fieldset disabled className="m-0 min-w-0 border-0 p-0">
        <VariableInspector key={variable.id} variable={variable} />
      </fieldset>
    </div>
  );
}
