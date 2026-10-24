import { NUMBER_KINDS } from "../group-kinds";
import { scaleDraftSteps } from "../scale-drafts";
import { NumberVisual } from "../board/number-visual";
import { useBoard } from "../use-board";
import type { ScaleStepsListProps } from "./generator.types";

/** The scale's steps as they'll be written: name, value, drawn for what they're for. */
export function ScaleStepsList({ draft }: ScaleStepsListProps) {
  const { store } = useBoard();
  const steps = scaleDraftSteps(store, draft);
  const kind =
    NUMBER_KINDS.find((k) => k.scopes.length > 0 && k.scopes.some((s) => draft.scopes.includes(s)))
      ?.id ?? "other";
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="flex flex-col divide-y divide-border rounded-md border border-border">
      {steps.map((step) => (
        <div key={step.name} className="flex h-9 items-center gap-2 px-2 text-xs">
          <span className={step.base ? "w-10 font-semibold" : "w-10"}>{step.name}</span>
          <div className="flex h-7 min-w-0 flex-1 items-center overflow-hidden">
            <NumberVisual kind={kind} value={step.value} max={max} />
          </div>
          <span className="font-mono text-muted-foreground">{step.value}</span>
        </div>
      ))}
    </div>
  );
}
