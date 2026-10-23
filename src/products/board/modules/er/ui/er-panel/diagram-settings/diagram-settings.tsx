import { erNotation, erStandard } from "@board";
import { useErDiagram, useErQuery } from "../../model";
import { FormSection } from "../forms/form-section";
import { ER_SETTING_CHOICES } from "./diagram-setting-choices";
import { ErSettingOption } from "./diagram-setting-option";
import { ErCheckList } from "./check-list";
import { ErStandardPicker } from "./standard-picker";
import type { ErDiagramLook, ErSettingKey } from "./diagram-settings.types";

/**
 * The shown diagram's settings, for when no shape is selected: the standard it follows (with its
 * reference), the Check diagram's findings, then the attribute style and the notation (`Diagram
 * [ … ]` in the text), each choice drawn as it shows. A choice equal to the standard's drops the
 * override, so the text only names what differs.
 */
export function ErDiagramSettings() {
  const diagram = useErDiagram();
  const read = useErQuery((d) => {
    const { entities, relations, attributes } = d.shapes();
    const first = [...entities, ...relations, ...attributes][0];
    return JSON.stringify({
      notation: first?.notation ?? {},
      style: attributes[0]?.look ?? "ellipse",
    });
  });
  const { notation, style } = JSON.parse(read) as ErDiagramLook;
  const settings = erNotation(notation);
  const standard = erStandard(notation);
  const preset = standard.settings;
  const issues = useErQuery((d) => d.check());

  const current = (key: ErSettingKey): string => {
    if (key === "style") return style;
    if (key === "crowFeet") return settings.crowFeet ? "on" : "off";
    return settings[key];
  };
  const choose = (key: ErSettingKey, value: string) => {
    if (key === "style") {
      diagram.edits.setStyle(value === "lollipop" ? "lollipop" : "ellipse");
      return;
    }
    const next = key === "crowFeet" ? value === "on" : value;
    diagram.setNotation({ [key]: next === preset[key] ? undefined : next });
  };

  if (!diagram.id) {
    return (
      <p className="text-xs text-muted-foreground">
        Select a shape of a diagram to see its settings.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        The diagram's standard, its check and how it's drawn. Select a shape to edit it instead.
      </p>
      <FormSection title="Standard">
        <ErStandardPicker
          standard={standard.id}
          onPick={(id) =>
            diagram.setNotation({
              standard: id === "cloudy" ? undefined : id,
              cardinality: undefined,
              ratio: undefined,
              participation: undefined,
              isa: undefined,
              crowFeet: undefined,
            })
          }
        />
      </FormSection>
      <FormSection title={checkTitle(issues.length)}>
        <ErCheckList issues={issues} />
      </FormSection>
      {ER_SETTING_CHOICES.map((choice) => (
        <FormSection key={choice.key} title={choice.label}>
          <p className="text-xs text-muted-foreground">{choice.hint}</p>
          <div
            role="group"
            aria-label={choice.label}
            className={
              choice.options.length > 2 ? "grid grid-cols-3 gap-1.5" : "grid grid-cols-2 gap-1.5"
            }
          >
            {choice.options.map((option) => (
              <ErSettingOption
                key={option.value}
                setting={choice.key}
                value={option.value}
                label={option.label}
                selected={current(choice.key) === option.value}
                onSelect={() => choose(choice.key, option.value)}
              />
            ))}
          </div>
        </FormSection>
      ))}
    </div>
  );
}

function checkTitle(count: number): string {
  return count === 0 ? "Check" : `Check (${count})`;
}
