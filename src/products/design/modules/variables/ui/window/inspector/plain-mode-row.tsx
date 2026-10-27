import { useBoard } from "../use-board";
import { ValueField } from "../../value-field";
import type { ModeValueCardProps } from "./inspector.types";
import { t } from "../../../variables.i18n";

/**
 * A text or boolean variable in one mode: its value (typed, or switched), "same as the first"
 * for a later mode without its own, and the link to another variable.
 */
export function PlainModeRow({ variable, mode }: ModeValueCardProps) {
  const { modes } = useBoard();
  return (
    <div className="flex items-center gap-2">
      {modes.length > 1 && (
        <span className="w-16 shrink-0 truncate text-xs text-muted-foreground">{mode.name}</span>
      )}
      <ValueField
        variable={variable}
        mode={mode.id}
        label={t("inspector.valueOf", { name: mode.name })}
        className="min-w-0 flex-1"
      />
    </div>
  );
}
