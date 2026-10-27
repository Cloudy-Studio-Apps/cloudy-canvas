import { tokenLeafOf } from "@canvas";
import { Button } from "@shared/ui/kit";
import { scaleFromRecord, scaleFromVariable } from "../scale-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { InspectorPartProps } from "./inspector.types";
import { t } from "../../../variables.i18n";

/**
 * A number's link to a scale: one of its steps (edit it, or unlink this one), its base (edit
 * it), or neither (make a scale from it).
 */
export function ScaleLink({ variable }: InspectorPartProps) {
  const { tokens, store } = useBoard();
  const setScaleDraft = useVariablesWindowStore((state) => state.setScaleDraft);
  const link = "text-primary hover:underline";
  const made = variable.generatorId ? store.scale(variable.generatorId) : undefined;
  if (made) {
    const base = made.baseVar ? store.variable(made.baseVar) : undefined;
    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-border p-2 text-xs text-muted-foreground">
        <span>
          {t("inspector.scaleStep")}{" "}
          <b className="text-foreground">{base ? base.name : made.baseValue}</b>
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            className={link}
            onClick={() => setScaleDraft(scaleFromRecord(made))}
          >
            {t("inspector.editScale")}
          </button>
          <button type="button" className={link} onClick={() => tokens.unlinkShade(variable.id)}>
            {t("inspector.unlink")}
          </button>
        </div>
      </div>
    );
  }
  const based = store.scales().filter((s) => s.baseVar === variable.id);
  if (based.length > 0) {
    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-border p-2 text-xs text-muted-foreground">
        <span>
          {t("inspector.scaleBase", {
            names: based.map((s) => tokenLeafOf(s.group) || t("inspector.aScale")).join(", "),
          })}
        </span>
        <div className="flex gap-3">
          {based.map((s) => (
            <button
              key={s.id}
              type="button"
              className={link}
              onClick={() => setScaleDraft(scaleFromRecord(s))}
            >
              {t("inspector.editScale")}
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
      onClick={() => setScaleDraft(scaleFromVariable(store, variable.id))}
    >
      {t("inspector.makeScale")}
    </Button>
  );
}
