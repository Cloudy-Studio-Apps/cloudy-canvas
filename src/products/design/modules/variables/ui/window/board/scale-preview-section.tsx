import { NUMBER_KINDS } from "../group-kinds";
import { leafName } from "../group-paths";
import { scaleDraftSteps } from "../scale-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { ScalePreviewSectionProps } from "./board.types";
import { CardGrid } from "./card-grid";
import { GhostNumberCard } from "./ghost-number-card";
import { NumberCard } from "./number-card";

/** The group the scale writes, previewed: its steps as ghost cards, then the rest. */
export function ScalePreviewSection({ group, rest }: ScalePreviewSectionProps) {
  const { store, shown } = useBoard();
  const draft = useVariablesWindowStore((state) => state.scaleDraft);
  if (!draft) return null;
  const steps = scaleDraftSteps(store, draft);
  const kind =
    NUMBER_KINDS.find((k) => k.scopes.length > 0 && k.scopes.some((s) => draft.scopes.includes(s)))
      ?.id ?? "other";
  const max = Math.max(1, ...steps.map((s) => s.value));
  const names = new Set(rest.map(leafName));
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-sm font-semibold">{group || "Ungrouped"}</span>
        <span className="text-xs text-primary">preview</span>
      </div>
      <CardGrid>
        {steps.map((step) => (
          <GhostNumberCard
            key={step.name}
            step={step}
            kind={kind}
            max={max}
            state={step.base ? "base" : names.has(step.name) ? "update" : "new"}
          />
        ))}
        {rest
          .filter((v) => !steps.some((step) => step.name === leafName(v)))
          .map((v) => (
            <NumberCard key={v.id} variable={v} shown={shown} max={max} selected={false} />
          ))}
      </CardGrid>
    </section>
  );
}
