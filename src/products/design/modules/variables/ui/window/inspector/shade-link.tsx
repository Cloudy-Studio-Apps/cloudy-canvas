import { tokenLeafOf } from "@canvas";
import { Button } from "@shared/ui/kit";
import { draftFromGenerator, draftFromVariable } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { InspectorPartProps } from "./inspector.types";
import { t } from "../../../variables.i18n";

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
          {t("inspector.generatedFrom")}{" "}
          <b className="text-foreground">{base ? base.name : made.baseColor.slice(0, 7)}</b>
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setDraft(draftFromGenerator(made))}
          >
            {t("inspector.editShades")}
          </button>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => tokens.unlinkShade(variable.id)}
          >
            {t("inspector.unlink")}
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
          {t("inspector.shadesBase", {
            names: based.map((g) => tokenLeafOf(g.group) || t("inspector.itsShades")).join(", "),
          })}
        </span>
        <div className="flex gap-3">
          {based.map((g) => (
            <button
              key={g.id}
              type="button"
              className="text-primary hover:underline"
              onClick={() => setDraft(draftFromGenerator(g))}
            >
              {t("inspector.editShades")}
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
      {t("inspector.makeShades")}
    </Button>
  );
}
