import { cardinalityRatio } from "../../../relation/cardinality-ratio";
import { useErDiagram, useErShapes } from "../../model";
import { FormSection } from "./form-section";
import { memberName } from "./shape-label";
import { AmountPicker, amountWord, FormHint } from "./visual";
import type { RelationFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** How many of each side there are, in words and dots. */
export function RelationAmounts({ relation }: RelationFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const ratio = cardinalityRatio(relation);
  const sides = relation.participants;
  const nameOf = (p: (typeof sides)[number]) => p.role || memberName(shapes, p.entityId);

  return (
    <FormSection
      title={t("form.amount.title")}
      actions={
        ratio && (
          <span
            className="font-mono text-xs text-muted-foreground"
            title={t("form.relation.ratioTitle")}
          >
            {ratio}
          </span>
        )
      }
    >
      <FormHint>{t("form.amount.hint")}</FormHint>
      {sides.map((side, i) => {
        const other = sides.length === 2 ? sides[1 - i] : undefined;
        const name = nameOf(side);
        const amount = amountWord(side.min, side.max);
        return (
          <div key={side.id} className="space-y-1">
            <p className="text-xs text-foreground">
              {other
                ? t("form.amount.each", { name, amount, other: nameOf(other) })
                : t("form.amount.eachAlone", { name, amount })}
            </p>
            <AmountPicker
              label={t("form.amount.pick", { name })}
              min={side.min}
              max={side.max}
              onChange={(min, max) =>
                er.edits.updateParticipant(relation.id, side.id, { min, max })
              }
            />
          </div>
        );
      })}
    </FormSection>
  );
}
