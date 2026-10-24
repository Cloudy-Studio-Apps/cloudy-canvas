import { Trash2 } from "lucide-react";
import { useState, type ComponentType } from "react";

import type { VariableType } from "@canvas";

import { CommitTextarea } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { AdvancedSettings } from "../../advanced-settings";
import { DeleteTokensDialog } from "@design/ui/components/styles";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { ColorModeCard } from "./color-mode-card";
import { ContrastList } from "./contrast-list";
import type { ModeValueCardProps, VariableInspectorProps } from "./inspector.types";
import { InspectorSection } from "./inspector-section";
import { NumberModeRow } from "./number-mode-row";
import { PlainModeRow } from "./plain-mode-row";
import { PurposeSelect } from "./purpose-select";
import { ScaleLink } from "./scale-link";
import { ShadeLink } from "./shade-link";
import { UsageRow } from "./usage-row";
import { VariableHeader } from "./variable-header";

/**
 * The picked variable in full: its name, its value in each mode (later modes may use the first's),
 * its shades or what a number is for, contrast, where it's used, its description and the rest.
 */
/** How each type's values are edited per mode. */
const MODE_VALUES: Readonly<Record<VariableType, ComponentType<ModeValueCardProps>>> = {
  color: ColorModeCard,
  number: NumberModeRow,
  string: PlainModeRow,
  boolean: PlainModeRow,
};

const TITLES: Readonly<Record<VariableType, string>> = {
  color: "Color",
  number: "Number",
  string: "Text",
  boolean: "Value",
};

export function VariableInspector({ variable }: VariableInspectorProps) {
  const { tokens, axis, modes } = useBoard();
  const select = useVariablesWindowStore((state) => state.select);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const color = variable.type === "color";
  const ModeValue = MODE_VALUES[variable.type];

  return (
    <div className="flex flex-col gap-4">
      <VariableHeader variable={variable} />
      <InspectorSection
        title={`${TITLES[variable.type]}${modes.length > 1 ? " per mode" : ""}`}
        actions={
          <button
            type="button"
            onClick={() => tokens.addMode(axis?.id ?? null)}
            className="hover:text-foreground"
          >
            + Mode
          </button>
        }
      >
        {modes.map((mode, i) => (
          <ModeValue key={mode.id} variable={variable} mode={mode} first={i === 0} />
        ))}
      </InspectorSection>
      {color && <ShadeLink variable={variable} />}
      {variable.type === "number" && (
        <>
          <PurposeSelect variable={variable} />
          <ScaleLink variable={variable} />
        </>
      )}
      {color && <ContrastList variable={variable} />}
      <UsageRow variable={variable} />
      <InspectorSection title="Description">
        <CommitTextarea
          aria-label="Description"
          placeholder="What it's for"
          value={variable.description}
          onCommit={(description) => tokens.updateVariable(variable.id, { description })}
          className="min-h-14 text-xs"
        />
      </InspectorSection>
      <AdvancedSettings variable={variable} />
      <Button
        variant="ghost"
        size="sm"
        className="justify-start text-destructive"
        onClick={() => setDeleting([variable.id])}
      >
        <Trash2 /> Delete variable
      </Button>
      <DeleteTokensDialog
        ids={deleting}
        onClose={() => {
          setDeleting(null);
          if (!tokens.store().variable(variable.id)) select(null);
        }}
      />
    </div>
  );
}
