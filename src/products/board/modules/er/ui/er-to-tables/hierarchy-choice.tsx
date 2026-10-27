import { ChoiceCards } from "@shared/ui/kit";
import type { HierarchyChoiceProps, StrategyOption } from "./er-to-tables.types";
import { StrategyPicture } from "./strategy-picture";
import { t } from "../../er.i18n";

const STRATEGIES: readonly StrategyOption[] = [
  {
    value: "per-entity",
    label: t("toTables.perEntity"),
    hint: t("toTables.perEntityHint"),
  },
  {
    value: "single",
    label: t("toTables.single"),
    hint: t("toTables.singleHint"),
  },
];

/** How one hierarchy becomes tables, as two cards with a picture each. */
export function HierarchyChoice({ label, value, onChange }: HierarchyChoiceProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">{label}</p>
      <ChoiceCards
        label={label}
        value={value}
        onChange={onChange}
        options={STRATEGIES.map((strategy) => ({
          ...strategy,
          picture: <StrategyPicture strategy={strategy.value} />,
        }))}
      />
    </div>
  );
}
