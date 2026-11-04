import { SwitchField } from "@shared/ui/kit";
import { dataFieldsOf, editTemplate } from "../../bindings";
import { TextTemplateField } from "./text-template-field";
import type { TextDataBlockProps } from "./text-data-block.types";
import { t } from "../../data.i18n";

/**
 * "Text from data": on, the text shows its template filled from the data, starting from what it
 * shows now; off, it keeps the text it shows.
 */
export function TextDataBlock({ text, names, apply }: TextDataBlockProps) {
  const template = dataFieldsOf(text).dataText;
  return (
    <div className="flex flex-col gap-2">
      <SwitchField
        label={t("section.text.toggle")}
        checked={template !== undefined}
        onChange={(on) => apply({ text: on ? { text: text.text, runs: [...text.runs] } : null })}
      />
      {template && (
        <TextTemplateField
          value={template.text}
          names={names}
          onCommit={(next) => apply({ text: editTemplate(template, next) })}
        />
      )}
    </div>
  );
}
