import { Minus, Plus } from "lucide-react";

import type { StepCountProps } from "./generator.types";
import { t } from "../../../variables.i18n";

/** A small count with − and + (how many steps below or above the base). */
export function StepCount({ label, value, max, onChange }: StepCountProps) {
  const button =
    "flex size-6 items-center justify-center rounded-md hover:bg-muted disabled:opacity-40";
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={t("generator.fewer", { name: label.toLowerCase() })}
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          className={button}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={t("generator.more", { name: label.toLowerCase() })}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={button}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
