import { SelectField } from "@shared/ui/kit";
import { NUMBER_KINDS, numberKindOf } from "../group-kinds";
import { useBoard } from "../use-board";
import type { InspectorPartProps } from "./inspector.types";
import { InspectorSection } from "./inspector-section";
import { t } from "../../../variables.i18n";

/** What a number is for: how its card draws and which fields' pickers offer it. */
export function PurposeSelect({ variable }: InspectorPartProps) {
  const { tokens } = useBoard();
  return (
    <InspectorSection title={t("generator.usedFor")}>
      <SelectField
        label={t("generator.usedFor")}
        value={numberKindOf(variable).id}
        options={NUMBER_KINDS.map((kind) => ({ value: kind.id, label: kind.label }))}
        onChange={(id) => {
          const kind = NUMBER_KINDS.find((k) => k.id === id);
          if (kind) tokens.updateVariable(variable.id, { scopes: kind.scopes });
        }}
      />
    </InspectorSection>
  );
}
