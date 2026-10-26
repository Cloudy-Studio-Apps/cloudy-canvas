import { Checkbox } from "@shared/ui/kit";
import type { FormulaLimitProps } from "./expression-builder.types";
import { OperandField } from "./operand-field";

/** A limit on a formula's result ("At least" / "At most"): off, or a variable or a number. */
export function FormulaLimit({ label, limit, onChange, modes, fallback }: FormulaLimitProps) {
  return (
    <div className="flex min-h-control-sm items-center gap-2">
      <Checkbox
        checked={limit !== null}
        onCheckedChange={(on) => onChange(on ? { kind: "number", value: fallback } : null)}
        label={<span className="w-16 text-xs">{label}</span>}
      />
      {limit ? (
        <OperandField label={label} operand={limit} onChange={onChange} modes={modes} />
      ) : null}
    </div>
  );
}
