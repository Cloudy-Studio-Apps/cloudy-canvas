import type { DesignNode } from "@design";
import { useEditNodes } from "../../hooks";
import type { NodeOptionButtonsProps } from "./node-fields.types";
import { PanelIconButton } from "./panel-section";
import { sharedValue } from "./shared-value";

/** A row of icon buttons for one choice bound to the selected nodes (e.g. text alignment). */
export function NodeOptionButtons<N extends DesignNode>({
  nodes,
  label,
  read,
  patch,
  options,
}: NodeOptionButtonsProps<N>) {
  const edit = useEditNodes();
  const current = sharedValue(nodes, read);
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-sm bg-muted p-0.5">
      {options.map((option) => (
        <PanelIconButton
          key={option.value}
          label={option.label}
          active={option.value === current}
          onClick={() => edit(nodes, (node) => patch(option.value, node as N))}
        >
          {option.icon}
        </PanelIconButton>
      ))}
    </div>
  );
}
