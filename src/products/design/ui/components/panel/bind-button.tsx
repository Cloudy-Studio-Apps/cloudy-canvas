import { Hexagon } from "lucide-react";

import { VariablePicker } from "@canvas-ui";
import { cn } from "@shared/ui/lib/utils";
import type { BindButtonProps } from "./bind-button.types";
import { t } from "../../design-ui.i18n";

/** The hover button beside a field that binds it to a variable (Figma's hexagon). */
export function BindButton({ binding, className }: BindButtonProps) {
  const { field } = binding;
  // Styles have their own control (the Typography section's style button).
  if (!field || field.type === "style") return null;
  return (
    <VariablePicker
      type={field.type}
      scopes={field.scopes}
      value={null}
      modes={binding.modes}
      onPick={(id) => binding.bind(id)}
    >
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the hover hexagon over a field */}
      <button
        type="button"
        aria-label={t("variable.useFor", { name: field.label.toLowerCase() })}
        title={t("variable.use")}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover/bind:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 data-[state=open]:opacity-100 [&_svg]:size-3.5",
          className,
        )}
      >
        <Hexagon />
      </button>
    </VariablePicker>
  );
}
