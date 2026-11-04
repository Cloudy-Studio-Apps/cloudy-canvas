import type { DataBindableField } from "../../bindings";
import { BindFieldRow } from "./bind-field-row";
import type { DataFieldsBlockProps } from "./data-fields-block.types";
import { t } from "../../data.i18n";

/**
 * "Fields": a row per field data can fill, then any other bound one (an agent's, a fill since
 * removed) so it can be unbound; with `boundOnly`, only the bound ones.
 */
export function DataFieldsBlock({
  bindable,
  fields,
  names,
  boundOnly,
  apply,
}: DataFieldsBlockProps) {
  const bound = fields.dataBindings ?? {};
  const offered = new Set(bindable.map((field) => field.path));
  const others: DataBindableField[] = Object.keys(bound)
    .filter((path) => !offered.has(path))
    .map((path) => ({ path, label: path, accepts: [] }));
  const rows = [...bindable, ...others].filter((field) => !boundOnly || bound[field.path]);
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-foreground">{t("section.fields.title")}</p>
      {rows.map((field) => (
        <BindFieldRow
          key={field.path}
          field={field}
          binding={bound[field.path]}
          names={names.filter((name) => name.type && field.accepts.includes(name.type))}
          onChange={(binding) => apply({ bindings: { [field.path]: binding } })}
        />
      ))}
    </div>
  );
}
