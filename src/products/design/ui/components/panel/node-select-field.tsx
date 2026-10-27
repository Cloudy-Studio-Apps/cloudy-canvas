import type { DesignNode } from "@design";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { useEditNodes } from "../../hooks";
import type { NodeSelectFieldProps } from "./node-fields.types";
import { sharedValue } from "./shared-value";
import { t } from "../../design-ui.i18n";

/** A compact select bound to the selected nodes ("Mixed" when their values differ). */
export function NodeSelectField<N extends DesignNode>({
  nodes,
  label,
  read,
  patch,
  options,
}: NodeSelectFieldProps<N>) {
  const edit = useEditNodes();
  return (
    <Select
      value={sharedValue(nodes, read) ?? undefined}
      onValueChange={(value) => edit(nodes, (node) => patch(value, node as N))}
    >
      <SelectTrigger aria-label={label} title={label} className="h-7 w-full text-xs">
        <SelectValue placeholder={t("panel.mixed")} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
