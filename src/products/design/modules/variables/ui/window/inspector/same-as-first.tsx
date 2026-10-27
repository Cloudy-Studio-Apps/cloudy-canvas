import { DEFAULT_VALUE } from "@canvas";
import { notifyError } from "@shared/stores/toast-store";
import { useBoard } from "../use-board";
import type { SameAsFirstProps } from "./same-as-first.types";
import { t } from "../../../variables.i18n";

/** A mode without its own value: striped, "same as Light"; a click gives it the same to change. */
export function SameAsFirst({ variable, mode, firstName }: SameAsFirstProps) {
  const { tokens } = useBoard();
  const fallback = variable.values[DEFAULT_VALUE];
  return (
    <button
      type="button"
      onClick={() => {
        if (!fallback) return;
        try {
          tokens.setValue(variable.id, mode.id, fallback);
        } catch (error) {
          notifyError(t("inspector.sameAsError"), error);
        }
      }}
      className="flex h-14 w-full flex-col items-center justify-center rounded-card border border-border bg-[repeating-linear-gradient(45deg,var(--surface-sunken)_0_8px,var(--surface)_8px_16px)] text-xs text-muted-foreground hover:text-primary"
    >
      <span>{t("inspector.sameAs", { mode: mode.name, first: firstName })}</span>
      <span className="text-[11px] text-subtle-foreground">{t("inspector.clickOwn")}</span>
    </button>
  );
}
