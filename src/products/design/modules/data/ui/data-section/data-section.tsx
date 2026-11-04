import { CheckboxField } from "@shared/ui/kit";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { isText } from "../../../text";
import { dataBindableFields, dataFieldsOf, scopeAt } from "../../bindings";
import { hasCatalogText } from "./has-catalog-text";
import { useDataSources } from "../hooks/use-data-sources";
import { BindFieldRow } from "./bind-field-row";
import { ConditionField } from "./condition-field";
import { pickerNames } from "./picker-names";
import { TextDataBlock } from "./text-data-block";
import { useBindData } from "./use-bind-data";
import { t } from "../../data.i18n";

/**
 * The selected layer's data: its text's template (texts, except those a catalog fills), the fields filled from data, and when
 * it shows. Every change is one `bindData` step; without sources it points at the Data tab.
 */
export function DataSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const sources = useDataSources();
  const node = nodes[0];
  const apply = useBindData(node?.id ?? "");
  if (!node) return null;

  if (sources.length === 0) {
    return (
      <PanelSection title={t("section.title")}>
        <p className="text-xs text-muted-foreground">{t("section.noSources")}</p>
      </PanelSection>
    );
  }

  const names = pickerNames(scopeAt(engine.doc, node.id));
  const fields = dataFieldsOf(node);
  const bindable = dataBindableFields(node, engine.kinds);

  return (
    <PanelSection title={t("section.title")}>
      <div className="flex flex-col gap-3">
        {isText(node) && !hasCatalogText(node) && (
          <TextDataBlock text={node} names={names} apply={apply} />
        )}
        {bindable.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-foreground">{t("section.fields.title")}</p>
            {bindable.map((field) => (
              <BindFieldRow
                key={field.path}
                field={field}
                binding={fields.dataBindings?.[field.path]}
                names={names.filter((name) => name.type && field.accepts.includes(name.type))}
                onChange={(binding) => apply({ bindings: { [field.path]: binding } })}
              />
            ))}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-foreground">{t("section.show.title")}</p>
          <ConditionField
            condition={fields.dataVisible}
            names={names}
            onChange={(visible) => apply({ visible })}
          />
          <CheckboxField
            label={t("section.show.hideEmpty")}
            checked={fields.dataHideEmpty === true}
            onChange={(hideWhenEmpty) => apply({ hideWhenEmpty })}
          />
        </div>
      </div>
    </PanelSection>
  );
}
