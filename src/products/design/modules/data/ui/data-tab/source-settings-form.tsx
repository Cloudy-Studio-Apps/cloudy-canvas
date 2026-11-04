import type { SourceFormProps } from "../data.points.types";
import { useDataRegistry } from "../hooks/use-data-registry";
import { SettingsForm } from "./settings-form";

/** A source's settings: its type's own form (`dataSourceForms`), or the generic one. */
export function SourceSettingsForm(props: SourceFormProps) {
  const { forms } = useDataRegistry();
  const Form = forms.find((entry) => entry.type === props.sourceType.id)?.component;
  if (Form) return <Form {...props} />;
  return (
    <SettingsForm
      specs={props.sourceType.settings}
      values={props.values}
      stored={props.stored}
      onChange={(values) => props.onChange(values)}
      onFilePicked={props.onFilePicked ? (name) => props.onFilePicked?.(name) : undefined}
    />
  );
}
