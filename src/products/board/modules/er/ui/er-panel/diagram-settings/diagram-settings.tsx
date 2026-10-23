import { ER_NOTATION_PRESETS, erNotation } from "@board";
import { useErDiagram, useErQuery } from "../../model";
import { FormSection } from "../forms/form-section";
import { ER_SETTING_CHOICES } from "./diagram-setting-choices";
import { ErSettingOption } from "./diagram-setting-option";
import type { ErDiagramLook, ErSettingKey } from "./diagram-settings.types";

/**
 * The shown diagram's look, for when no shape is selected: the attribute style and the notation
 * (`Diagram [ … ]` in the text), each choice drawn as it shows. A notation choice equal to the
 * preset's drops the override, so the text only names what differs.
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
  const preset = ER_NOTATION_PRESETS[notation.preset ?? "chen"];

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
        How this diagram is drawn. Select a shape to edit it instead.
      </p>
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
