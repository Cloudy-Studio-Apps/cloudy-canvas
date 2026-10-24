import type { DesignNode } from "@design";
import { SegmentedControl } from "@shared/ui/kit";
import { useEditNodes } from "../../hooks";
import type { NodeOptionButtonsProps } from "./node-fields.types";
import { sharedValue } from "./shared-value";

/**
 * A row of icon buttons for one choice bound to the selected nodes (e.g. text alignment): the
 * kit's `SegmentedControl`, nothing pressed while the selection's values differ.
 */
export function NodeOptionButtons<N extends DesignNode>({
  nodes,
  label,
  read,
  patch,
  options,
}: NodeOptionButtonsProps<N>) {
  const edit = useEditNodes();
  return (
    <SegmentedControl
      label={label}
      value={sharedValue(nodes, read)}
      onChange={(value) => edit(nodes, (node) => patch(value, node as N))}
      options={options}
      iconOnly
      size="sm"
    />
  );
}
