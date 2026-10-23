import { ChevronLeft, Table2 } from "lucide-react";

import { erNotation, erStandard } from "@board";
import { Button } from "@shared/ui/components/ui/button";
import { useErDiagram, useErQuery } from "../../model";
import { useErToTablesStore } from "../../er-to-tables";
import { FormSection } from "../forms/form-section";
import { ER_SETTING_CHOICES } from "./diagram-setting-choices";
import { ErSettingOption } from "./diagram-setting-option";
import { ErCheckList } from "./check-list";
import { ErDiagramList } from "./diagram-list";
import { useShowAllDiagrams } from "../use-show-all-diagrams";
import { ErStandardPicker } from "./standard-picker";
import type { ErDiagramLook, ErSettingKey } from "./diagram-settings.types";

/**
 * The shown diagram's settings, for when no shape is selected (the board's diagrams to pick from
 * while none is shown, `ErDiagramList`): the standard it follows (with its
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
  const showAll = useShowAllDiagrams();
  const empty = useErQuery((d) => {
    const { entities, relations } = d.shapes();
    return entities.length + relations.length === 0;
  });

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

  // No diagram shown (none picked yet, or the shown one was deleted): the board's diagrams.
  if (!diagram.id || empty) return <ErDiagramList />;
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="-ml-1 flex items-center gap-1 rounded-md px-1 py-0.5 text-xs text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:bg-hover"
        onClick={showAll}
      >
        <ChevronLeft className="size-3.5" />
        All diagrams
      </button>
      <p className="text-xs text-muted-foreground">
        The diagram's standard, its check and how it's drawn. Select a shape to edit it instead.
      </p>
      <FormSection title="Standard">
        <ErStandardPicker
          standard={notation.standard ?? "cloudy"}
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
      <FormSection title="Tables">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => useErToTablesStore.getState().open(diagram.id)}
        >
          <Table2 />
          Create tables…
        </Button>
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
