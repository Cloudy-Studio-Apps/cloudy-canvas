import { ShapeSelect } from "./shape-select";
import type { CardinalityPickerProps } from "./cardinality-picker.types";
import { t } from "../../../er.i18n";

const MINS = ["0", "1", "2"].map((v) => ({ value: v, label: v }));
const MAXES = ["1", "n", "2"].map((v) => ({
  value: v,
  label: v === "n" ? t("form.cardinality.many") : v,
}));

/** `(min,max)` as two small selects. */
export function CardinalityPicker({ min, max, onChange, optional }: CardinalityPickerProps) {
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-xs text-muted-foreground">
      (
      <ShapeSelect
        aria-label={t("form.cardinality.minimum")}
        value={min}
        options={MINS}
        placeholder={optional ? "–" : undefined}
        className="w-11"
        onChange={(value) => onChange(value, value && !max ? "n" : value ? max : "")}
      />
      ,
      <ShapeSelect
        aria-label={t("form.cardinality.maximum")}
        value={max}
        options={MAXES}
        placeholder={optional ? "–" : undefined}
        className="w-14"
        onChange={(value) => onChange(value && !min ? "0" : value ? min : "", value)}
      />
      )
    </span>
  );
}
