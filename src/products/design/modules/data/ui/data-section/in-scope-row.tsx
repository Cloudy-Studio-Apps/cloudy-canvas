import { runRepeat } from "../repeat-section/run-repeat";
import { PreviewRowInput } from "./preview-row-input";
import type { InScopeRowProps } from "./in-scope-row.types";
import { t } from "../../data.i18n";

/**
 * One loop in scope: the row's name, where it comes from, and its row: ◀ n of N ▶ where the layer
 * shows the loop's preview (one undo step each), else "3 of 40" as text ("Not on this device"
 * when its list can't be read here).
 */
export function InScopeRow({ layer, loop: { from, step } }: InScopeRowProps) {
  const row = layer.unreadable
    ? t("scope.unreadable")
    : layer.count === 0
      ? t("scope.empty")
      : t("scope.rowOf", { n: layer.index + 1, count: layer.count });
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="shrink-0 font-mono text-xs text-foreground">{layer.name}</span>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={from}>
          {from}
        </span>
        {!step && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{row}</span>
        )}
      </div>
      {step && (
        <PreviewRowInput
          label={t("scope.row")}
          count={step.count}
          value={step.row}
          onChange={(next) => runRepeat(() => step.set(next))}
        />
      )}
    </div>
  );
}
