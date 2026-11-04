import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { isText } from "../../../text";
import { dataBindableFields, dataFieldsOf, isCatalogText, scopeAt } from "../../bindings";
import { useDataSources } from "../hooks/use-data-sources";
import { DataFieldsBlock } from "./data-fields-block";
import { pickerNames } from "./picker-names";
import { ShowWhenBlock } from "./show-when-block";
import { TextDataBlock } from "./text-data-block";
import { useBindData } from "./use-bind-data";
import { t } from "../../data.i18n";

/**
 * The selected layer's data: its text's template (texts, except those a catalog fills), the
 * fields filled from data, and when it shows. Every change is one `bindData` step. Without
 * sources it points at the Data tab and keeps only what is bound, so it can still be undone.
 */
export function DataSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const sources = useDataSources();
  const node = nodes[0];
  const apply = useBindData(node?.id ?? "");
  if (!node) return null;

  const empty = sources.length === 0;
  const names = empty ? [] : pickerNames(scopeAt(engine.doc, node.id));
  const fields = dataFieldsOf(node);
  const text =
    isText(node) && !isCatalogText(node) && (!empty || fields.dataText !== undefined) ? node : null;

  return (
    <PanelSection title={t("section.title")}>
      <div className="flex flex-col gap-3">
        {empty && <p className="text-xs text-muted-foreground">{t("section.noSources")}</p>}
        {text && <TextDataBlock text={text} names={names} apply={apply} />}
        <DataFieldsBlock
          bindable={dataBindableFields(node, engine.kinds)}
          fields={fields}
          names={names}
          boundOnly={empty}
          apply={apply}
        />
        <ShowWhenBlock fields={fields} names={names} setOnly={empty} apply={apply} />
      </div>
    </PanelSection>
  );
}
