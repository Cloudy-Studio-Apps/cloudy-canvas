import { templateOptions } from "../../sheet/template-choice";
import { TemplateOptions } from "../picker/template-options";
import { TemplatePicker } from "../picker/template-picker";
import type { ChoiceEditorProps } from "./choice-editor.types";

/** The template picker, then the chosen template's options. */
export function ChoiceEditor({ category, group, choice, onChoose }: ChoiceEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <TemplateOptions
        template={choice.template}
        options={choice.options}
        onChange={(options) => onChoose(choice.template, options)}
      />
      <TemplatePicker
        category={category}
        group={group}
        current={choice.template.id}
        options={choice.options}
        onPick={(template) => onChoose(template, templateOptions(template, choice.options))}
      />
    </div>
  );
}
