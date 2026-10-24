import type { DesignNode } from "@design";
import { Checkbox } from "@shared/ui/kit";
import { useEditNodes } from "../../hooks";
import type { NodeCheckboxProps } from "./node-fields.types";

/** A checkbox bound to the selected nodes: checked when all are; toggling sets all of them. */
export function NodeCheckbox<N extends DesignNode>({
  nodes,
  label,
  read,
  patch,
}: NodeCheckboxProps<N>) {
  const edit = useEditNodes();
  const checked = nodes.length > 0 && nodes.every(read);
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(next) => edit(nodes, (node) => patch(next, node as N))}
      label={label}
      className="text-muted-foreground"
    />
  );
}
