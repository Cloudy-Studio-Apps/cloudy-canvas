import type { SheetFieldsProps } from "./sheet-section.types";
import { Button, Section, SwitchField } from "@shared/ui/kit";
import { useStyleguide, useStyleguideOutline } from "../hooks/use-styleguide";
import { useTemplateChoice } from "../hooks/use-template-choice";
import { ChoiceEditor } from "./choice-editor";
import { SourceFields } from "./source-fields";
import { t } from "../../styleguide.i18n";

/** The fields of a selected live element (`SheetSection`): source, template, modes, convert. */
export function SheetFields({ sheet, count }: SheetFieldsProps) {
  const { styleguide } = useStyleguide();
  const outline = useStyleguideOutline();
  const entry = outline.find((item) => item.category.id === sheet.sheet.category);
  const choice = useTemplateChoice(entry?.category, sheet.sheet.group, sheet.sheet);
  return (
    <Section title={t("sidebar.sheet.title")}>
      <div className="flex flex-col gap-3">
        {count === 1 && <SourceFields sheet={sheet} outline={outline} />}
        {count === 1 && entry && choice && (
          <>
            {sheet.sheet.template && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => styleguide.setSheet(sheet.id, { template: null, options: null })}
              >
                {t("sidebar.sheet.useSystem")}
              </Button>
            )}
            <ChoiceEditor
              category={entry.category}
              group={sheet.sheet.group}
              choice={choice}
              onChoose={(template, options) =>
                styleguide.setSheet(sheet.id, { template: template.id, options: { ...options } })
              }
            />
            <SwitchField
              label={t("sidebar.sheet.sideBySide")}
              checked={sheet.sheet.modeView === "all"}
              onChange={(on) => styleguide.setSheet(sheet.id, { modeView: on ? "all" : "current" })}
            />
          </>
        )}
        <Button size="sm" variant="outline" onClick={() => styleguide.convert([sheet.id])}>
          {t("sidebar.sheet.convert")}
        </Button>
      </div>
    </Section>
  );
}
