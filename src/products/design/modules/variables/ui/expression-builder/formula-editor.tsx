import type { FormulaRounding } from "@canvas";
import { SegmentedControl } from "@shared/ui/kit";
import { ChainEditor } from "./chain-editor";
import type { FormulaEditorProps, RoundingOption } from "./expression-builder.types";
import { FormulaLimit } from "./formula-limit";
import { t } from "../../variables.i18n";

const ROUNDINGS: readonly RoundingOption[] = [
  { value: "none", label: t("builder.exact"), title: t("builder.exactHint") },
  { value: "round", label: t("builder.round"), title: t("builder.roundHint") },
  { value: "floor", label: t("builder.down"), title: t("builder.downHint") },
  { value: "ceil", label: t("builder.up"), title: t("builder.upHint") },
];

/**
 * A formula as steps: what it starts from, then each step applied in order (add, subtract,
 * multiply, divide by a variable, a number or a group in parentheses: `({a} + {b}) / 34` is
 * start a, + b, ÷ 34; `{a} * ({b} + {c})` is start a, × a group of b + c), then rounding and
 * limits.
 */
export function FormulaEditor({ formula, onChange, modes }: FormulaEditorProps) {
  const patch = (next: Partial<typeof formula>) => onChange({ ...formula, ...next });
  return (
    <div className="flex flex-col gap-3">
      <ChainEditor
        chain={formula}
        depth={0}
        modes={modes}
        onChange={(chain) => patch({ start: chain.start, steps: chain.steps })}
      />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("builder.rounding")}</span>
        <SegmentedControl
          label={t("builder.rounding")}
          size="sm"
          fullWidth
          value={formula.rounding}
          onChange={(rounding: FormulaRounding) => patch({ rounding })}
          options={ROUNDINGS}
        />
      </div>
      <div className="flex flex-col gap-1">
        <FormulaLimit
          label={t("builder.atLeast")}
          limit={formula.min}
          fallback={0}
          modes={modes}
          onChange={(min) => patch({ min })}
        />
        <FormulaLimit
          label={t("builder.atMost")}
          limit={formula.max}
          fallback={100}
          modes={modes}
          onChange={(max) => patch({ max })}
        />
      </div>
    </div>
  );
}
