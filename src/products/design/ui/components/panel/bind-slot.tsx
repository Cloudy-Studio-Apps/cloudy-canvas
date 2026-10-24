import { VariableChip } from "@canvas-ui";
import { cn } from "@shared/ui/lib/utils";
import { useFieldBinding } from "../../hooks";
import { BindButton } from "./bind-button";
import type { BindSlotProps } from "./bind-button.types";

/**
 * Wraps any field of the selected layers whose value can come from a variable: bound, the
 * variable's chip shows instead of it (detach to type again); unbound, a hover button binds it.
 */
export function BindSlot({ nodes, path, className, children }: BindSlotProps) {
  const binding = useFieldBinding(nodes, path);
  if (binding.bound !== undefined && binding.field && binding.field.type !== "style") {
    return (
      <VariableChip
        variableId={binding.bound}
        modes={binding.modes}
        type={binding.field.type}
        scopes={binding.field.scopes}
        onPick={(id) => binding.bind(id)}
        onDetach={() => binding.bind(null)}
        className={cn("min-w-0", className)}
      />
    );
  }
  return (
    <div className={cn("group/bind flex min-w-0 items-center", className)}>
      <div className="min-w-0 flex-1">{children}</div>
      <BindButton binding={binding} className="-mr-1" />
    </div>
  );
}
