import { CheckboxField } from "@shared/ui/kit";
import { ConditionField } from "./condition-field";
import type { ShowWhenBlockProps } from "./show-when-block.types";
import { t } from "../../data.i18n";

/** "Show when": the show condition and "Hide when empty"; with `setOnly`, only those set. */
export function ShowWhenBlock({ fields, names, setOnly, apply }: ShowWhenBlockProps) {
  const condition = !setOnly || fields.dataVisible !== undefined;
  const hideEmpty = !setOnly || fields.dataHideEmpty === true;
  if (!condition && !hideEmpty) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-foreground">{t("section.show.title")}</p>
      {condition && (
        <ConditionField
          condition={fields.dataVisible}
          names={names}
          onChange={(visible) => apply({ visible })}
        />
      )}
      {hideEmpty && (
        <CheckboxField
          label={t("section.show.hideEmpty")}
          checked={fields.dataHideEmpty === true}
          onChange={(hideWhenEmpty) => apply({ hideWhenEmpty })}
        />
      )}
    </div>
  );
}
