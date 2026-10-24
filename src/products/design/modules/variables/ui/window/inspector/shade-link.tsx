import { tokenLeafOf } from "@canvas";
import { Button } from "@shared/ui/components/ui/button";
import { draftFromGenerator, draftFromVariable } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { InspectorPartProps } from "./inspector.types";

/**
 * A color's link to shades: made by a generator (edit it, or unlink this one), the base of some
 * (edit them), or neither (make shades from it).
 */
export function ShadeLink({ variable }: InspectorPartProps) {
  const { tokens, store } = useBoard();
  const setDraft = useVariablesWindowStore((state) => state.setDraft);
  const made = variable.generatorId ? store.generator(variable.generatorId) : undefined;
  if (made) {
    const base = made.baseVar ? store.variable(made.baseVar) : undefined;
    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-border p-2 text-xs text-muted-foreground">
        <span>
          Generated from{" "}
          <b className="text-foreground">{base ? base.name : made.baseColor.slice(0, 7)}</b>
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setDraft(draftFromGenerator(made))}
          >
            Edit shades
          </button>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => tokens.unlinkShade(variable.id)}
          >
            Unlink
          </button>
        </div>
      </div>
    );
  }
  const based = store.generators().filter((g) => g.baseVar === variable.id);
  if (based.length > 0) {
    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-border p-2 text-xs text-muted-foreground">
        <span>
          Base of {based.map((g) => tokenLeafOf(g.group) || "its shades").join(", ")} · its shades
          follow it
        </span>
        <div className="flex gap-3">
          {based.map((g) => (
            <button
              key={g.id}
              type="button"
              className="text-primary hover:underline"
              onClick={() => setDraft(draftFromGenerator(g))}
            >
              Edit shades
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setDraft(draftFromVariable(store, variable.id))}
    >
      Make shades from this color
    </Button>
  );
}
