import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { NUMBER_KINDS, numberKindOf } from "../group-kinds";
import { useBoard } from "../use-board";
import type { InspectorPartProps } from "./inspector.types";
import { InspectorSection } from "./inspector-section";

/** What a number is for: how its card draws and which fields' pickers offer it. */
export function PurposeSelect({ variable }: InspectorPartProps) {
  const { tokens } = useBoard();
  return (
    <InspectorSection title="Used for">
      <Select
        value={numberKindOf(variable).id}
        onValueChange={(id) => {
          const kind = NUMBER_KINDS.find((k) => k.id === id);
          if (kind) tokens.updateVariable(variable.id, { scopes: kind.scopes });
        }}
      >
        <SelectTrigger aria-label="Used for" className="h-7 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NUMBER_KINDS.map((kind) => (
            <SelectItem key={kind.id} value={kind.id}>
              {kind.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </InspectorSection>
  );
}
