import type { SheetFieldsProps } from "./sheet-section.types";
import { Button, Section, Switch } from "@shared/ui/kit";
import { useStyleguide, useStyleguideOutline } from "../hooks/use-styleguide";
import { useTemplateChoice } from "../hooks/use-template-choice";
import { ChoiceEditor } from "./choice-editor";
import { SourceFields } from "./source-fields";

/** The fields of a selected live element (`SheetSection`): source, template, modes, convert. */
export function SheetFields({ sheet, count }: SheetFieldsProps) {
  const { styleguide } = useStyleguide();
  const outline = useStyleguideOutline();
  const entry = outline.find((item) => item.category.id === sheet.sheet.category);
  const choice = useTemplateChoice(entry?.category, sheet.sheet.group, sheet.sheet);
  return (
    <Section title="Design system">
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
                Use the design system&apos;s template
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
            <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              Show modes side by side
              <Switch
                checked={sheet.sheet.modeView === "all"}
                onCheckedChange={(on) =>
                  styleguide.setSheet(sheet.id, { modeView: on ? "all" : "current" })
                }
              />
            </label>
          </>
        )}
        <Button size="sm" variant="outline" onClick={() => styleguide.convert([sheet.id])}>
          Convert to design
        </Button>
      </div>
    </Section>
  );
}
