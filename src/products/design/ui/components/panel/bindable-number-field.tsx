import type { DesignNode } from "@design";
import { BindSlot } from "./bind-slot";
import type { BindableNumberFieldExtra } from "./bind-button.types";
import type { NodeNumberFieldProps } from "./node-fields.types";
import { NodeNumberField } from "./node-number-field";

/** A `NodeNumberField` whose value can come from a number variable (see `BindSlot`). */
export function BindableNumberField<N extends DesignNode>({
  path,
  className,
  ...props
}: NodeNumberFieldProps<N> & BindableNumberFieldExtra) {
  return (
    <BindSlot nodes={props.nodes} path={path} className={className}>
      <NodeNumberField {...props} />
    </BindSlot>
  );
}
