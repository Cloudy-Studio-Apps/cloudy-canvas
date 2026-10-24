import { ChoiceCards } from "@shared/ui/kit";
import type { HierarchyChoiceProps, StrategyOption } from "./er-to-tables.types";
import { StrategyPicture } from "./strategy-picture";

const STRATEGIES: readonly StrategyOption[] = [
  {
    value: "per-entity",
    label: "One table per entity",
    hint: "Children keyed by the parent's key.",
  },
  {
    value: "single",
    label: "One table for all",
    hint: "Every column in the parent's table, with a discriminator.",
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
