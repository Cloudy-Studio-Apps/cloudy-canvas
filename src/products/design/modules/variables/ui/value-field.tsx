import { Link, Sigma, Unlink, X } from "lucide-react";

import {
  asTokenValue,
  DOCUMENT_TOKENS,
  joinTokenColor,
  resolveVariable,
  splitTokenColor,
  valueKeyOf,
  DEFAULT_VALUE,
  type TokenValue,
} from "@canvas";
import {
  ColorField,
  useDocumentTokens,
  VariableChip,
  VariablePicker,
  VariableValue,
} from "@canvas-ui";
import { NumberField } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { cn } from "@shared/ui/kit";
import { BooleanValueInput } from "./boolean-value-input";
import { ExpressionBuilder } from "./expression-builder";
import { ExpressionInput } from "./expression-input";
import { StringValueInput } from "./string-value-input";
import type { ActionButtonProps, ValueFieldProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

/**
 * A variable's value for one mode: a color (with its alpha) or a number, the variable it
 * aliases (a chip; detaching keeps the value it gave), or a number's expression (`ExpressionInput`;
 * "Use its value instead" keeps what it works out to). A mode without its own value shows the
 * default faded, and clicking it gives the mode a value of its own; one with a value can clear it.
 */
export function ValueField({ variable, mode, label, cell, className }: ValueFieldProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const { store } = useDocumentTokens();
  const key = valueKeyOf(store, mode);
  const value = variable.values[key];
  const modes = modeContextFor(store.axes(), mode);

  const ghost = cell ? CELL : undefined;
  const set = (next: TokenValue) => {
    try {
      tokens.setValue(variable.id, mode, next);
    } catch (error) {
      notifyError(t("value.setError"), error);
    }
  };

  if (!value) {
    const fallback = variable.values[DEFAULT_VALUE];
    return (
      <button
        type="button"
        onClick={() => fallback && set(fallback)}
        title={t("value.usesDefault")}
        className={cn(
          "flex h-7 min-w-0 items-center gap-1.5 rounded-md px-2 text-left text-xs text-subtle-foreground hover:bg-muted",
          !cell && "border border-dashed border-border",
          className,
        )}
      >
        <span className="opacity-40">
          <VariableValue variable={variable} modes={{}} />
        </span>
        <span className="opacity-60">{t("value.sameAsFirst")}</span>
      </button>
    );
  }

  const clear =
    key !== DEFAULT_VALUE ? (
      <ActionButton
        label={t("value.useDefault")}
        onClick={() => tokens.clearValue(variable.id, key)}
      >
        <X />
      </ActionButton>
    ) : null;

  if ("expr" in value) {
    return (
      <div className={cn("group/value flex min-w-0 items-center gap-0.5", className)}>
        <ExpressionInput
          variable={variable}
          mode={mode}
          expr={value.expr}
          modes={modes}
          label={label}
          className={ghost}
        />
        <ActionButton
          label={t("value.useValue")}
          onClick={() => {
            const resolved = asTokenValue(resolveVariable(store, variable.id, modes));
            if (resolved) set(resolved);
          }}
        >
          <Unlink />
        </ActionButton>
        {clear}
      </div>
    );
  }

  if ("alias" in value) {
    return (
      <div className={cn("group/value flex min-w-0 items-center gap-0.5", className)}>
        <VariableChip
          variableId={value.alias}
          modes={modes}
          type={variable.type}
          scopes={[]}
          onPick={(alias) => set({ alias })}
          onDetach={() => {
            const resolved = asTokenValue(resolveVariable(store, variable.id, modes));
            if (resolved) set(resolved);
          }}
          className="min-w-0 flex-1"
        />
        {clear}
      </div>
    );
  }

  const link = (
    <VariablePicker
      type={variable.type}
      scopes={[]}
      value={null}
      modes={modes}
      onPick={(alias) => set({ alias })}
    >
      <ActionButton label={t("value.useOther")}>
        <Link />
      </ActionButton>
    </VariablePicker>
  );

  if (variable.type === "color") {
    const { hex, alpha } = splitTokenColor("color" in value ? value.color : "#000000");
    return (
      <div className={cn("group/value flex min-w-0 items-center gap-0.5", className)}>
        <ColorField
          color={hex.toLowerCase()}
          opacity={alpha}
          label={t("value.colorOf", { label })}
          onChange={(next) => set({ color: joinTokenColor(next.color, next.opacity) })}
          className={cn("min-w-0 flex-1", ghost)}
        />
        {link}
        {clear}
      </div>
    );
  }

  if (variable.type === "string" || variable.type === "boolean") {
    return (
      <div className={cn("group/value flex min-w-0 items-center gap-0.5", className)}>
        {variable.type === "string" ? (
          <StringValueInput
            value={"string" in value ? value.string : ""}
            label={label}
            onChange={(string) => set({ string })}
            className={ghost}
          />
        ) : (
          <BooleanValueInput
            value={"boolean" in value ? value.boolean : false}
            label={label}
            onChange={(boolean) => set({ boolean })}
            className={ghost}
          />
        )}
        {link}
        {clear}
      </div>
    );
  }

  return (
    <div className={cn("group/value flex min-w-0 items-center gap-0.5", className)}>
      <NumberField
        prefix="#"
        label={label}
        value={"number" in value ? value.number : null}
        onCommit={(number) => set({ number })}
        className={cn("min-w-0 flex-1", ghost)}
      />
      <ExpressionBuilder
        variable={variable}
        mode={mode}
        expr={null}
        start={"number" in value ? value.number : 0}
        modes={modes}
      >
        <ActionButton label={t("value.workOut")} shown>
          <Sigma />
        </ActionButton>
      </ExpressionBuilder>
      {link}
      {clear}
    </div>
  );
}

/** A table cell's field: flat until hovered or focused. */
const CELL = "bg-transparent hover:bg-muted focus-within:bg-surface-sunken";

/**
 * A row action shown on hover (alias, use the default), so values stay uncluttered; `shown` ones
 * (working a number out from others) are always there to be found.
 */
function ActionButton({ label, children, shown, ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5",
        !shown &&
          "opacity-0 group-hover/value:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
      )}
    >
      {children}
    </button>
  );
}
/** The modes context that shows `mode` (its axis set to it). */
function modeContextFor(
  axes: readonly { id: string; modes: readonly { id: string }[] }[],
  mode: string,
): Record<string, string> {
  const axis = axes.find((a) => a.modes.some((m) => m.id === mode));
  return axis ? { [axis.id]: mode } : {};
}
