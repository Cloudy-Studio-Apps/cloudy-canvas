import { useState } from "react";
import { Plus } from "lucide-react";

import { ChoiceCards } from "@shared/ui/kit";
import { CardinalityPicker } from "../cardinality-picker";
import { AMOUNTS, amountWord } from "./amount";
import type { AmountDotsProps, AmountPickerProps } from "./amount-picker.types";
import { t } from "../../../../er.i18n";

const OTHER = "other";

/** How many, as dots: solid ones are always there, dashed ones optional. */
function Dots({ min, max }: AmountDotsProps) {
  const count = max === "n" ? 3 : 1;
  return (
    <svg viewBox="0 0 38 14" aria-hidden className="h-3.5 w-[38px]">
      {Array.from({ length: count }, (_, i) => {
        const x = 19 + (i - (count - 1) / 2) * 12;
        return i < Number(min) ? (
          <circle key={i} cx={x} cy={7} r={4.4} fill="currentColor" />
        ) : (
          <circle
            key={i}
            cx={x}
            cy={7}
            r={4.2}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeDasharray="2.4 1.8"
          />
        );
      })}
    </svg>
  );
}

/** Picks a `(min,max)` from the usual amounts, with "other" for the rest. */
export function AmountPicker({ label, min, max, onChange }: AmountPickerProps) {
  const preset = AMOUNTS.some(([a, b]) => a === min && b === max);
  const [other, setOther] = useState(!preset);
  const custom = other || !preset;
  return (
    <div className="space-y-1">
      <ChoiceCards
        label={label}
        columns={5}
        className="gap-1"
        value={custom ? OTHER : `${min}:${max}`}
        onChange={(value) => {
          if (value === OTHER) return setOther(true);
          const [nextMin = "", nextMax = ""] = value.split(":");
          setOther(false);
          onChange(nextMin, nextMax);
        }}
        options={[
          ...AMOUNTS.map(([a, b]) => ({
            value: `${a}:${b}`,
            label: amountWord(a, b),
            picture: <Dots min={a} max={b} />,
          })),
          {
            value: OTHER,
            label: t("form.amount.other"),
            picture: <Plus className="size-3.5" aria-hidden />,
          },
        ]}
      />
      {custom && <CardinalityPicker min={min} max={max} onChange={onChange} />}
    </div>
  );
}
