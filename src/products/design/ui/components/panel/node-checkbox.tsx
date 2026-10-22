import type { DesignNode } from "@design";
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
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => edit(nodes, (node) => patch(!checked, node as N))}
        className="accent-primary"
      />
      {label}
    </label>
  );
}
