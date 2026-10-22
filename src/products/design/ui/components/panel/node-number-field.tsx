import type { DesignNode } from "@design";
import { useEditNodes } from "../../hooks";
import type { NodeNumberFieldProps } from "./node-fields.types";
import { NumberField } from "./number-field";
import { sharedValue } from "./shared-value";

/** A `NumberField` bound to the selected nodes: shows their shared value, sets it on all. */
export function NodeNumberField<N extends DesignNode>({
  nodes,
  read,
  patch,
  ...field
}: NodeNumberFieldProps<N>) {
  const edit = useEditNodes();
  return (
    <NumberField
      {...field}
      value={sharedValue(nodes, read)}
      onCommit={(value) => edit(nodes, (node) => patch(value, node as N))}
    />
  );
}
