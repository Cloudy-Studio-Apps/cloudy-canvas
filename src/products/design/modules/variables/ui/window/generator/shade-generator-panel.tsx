import { X } from "lucide-react";

import { SHADE_STEPS, type GeneratorInput, type ShadeSteps } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { notifyError } from "@shared/stores/toast-store";
import { joinPath } from "../group-paths";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { BaseColorField } from "./base-color-field";
import { GeneratorSlider } from "./generator-slider";
import { Segmented } from "./segmented";
import type { ShadeGeneratorPanelProps } from "./generator.types";
import { ShadeStrips } from "./shade-strips";

const STEPS: { value: ShadeSteps; label: string }[] = [
  { value: "50-950", label: "50–950" },
  { value: "100-900", label: "100–900" },
  { value: "5", label: "5 steps" },
];

/**
 * The inspector while generating shades: base, group, steps, how light and dark they go, how the
 * ends soften and what the other modes get, with strips; the board shows them as ghost cards.
 */
export function ShadeGeneratorPanel({ draft }: ShadeGeneratorPanelProps) {
  const { tokens, modes } = useBoard();
  const { setDraft, select } = useVariablesWindowStore();
  const change = (patch: Partial<GeneratorInput>) => setDraft({ ...draft, ...patch });
  const save = () => {
    try {
      const generator = tokens.saveGenerator(draft);
      const shade = tokens.store().byPath(generator.collectionId, joinPath(generator.group, "500"));
      select(shade?.id ?? generator.baseVar);
    } catch (error) {
      notifyError("Couldn't make the shades", error);
    }
  };
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{draft.id ? "Edit shades" : "Generate shades"}</h3>
        <button
          type="button"
          aria-label="Cancel"
          onClick={() => setDraft(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <BaseColorField draft={draft} change={change} />
      <label className="flex flex-col gap-1.5 text-xs">
        <span className="text-muted-foreground">Group name</span>
        <CommitInput
          aria-label="Group name"
          value={draft.group}
          onCommit={(group) => change({ group })}
          className="h-7 text-xs"
        />
      </label>
      <Segmented
        label="Steps"
        value={draft.steps}
        options={STEPS}
        onChange={(steps) => change({ steps })}
      />
      <GeneratorSlider
        label="Lightest"
        value={draft.lightest}
        min={0.8}
        max={0.99}
        step={0.005}
        onChange={(lightest) => change({ lightest })}
      />
      <GeneratorSlider
        label="Darkest"
        value={draft.darkest}
        min={0.1}
        max={0.45}
        step={0.005}
        onChange={(darkest) => change({ darkest })}
      />
      <GeneratorSlider
        label="Soften the ends"
        value={draft.fade}
        min={0}
        max={1}
        step={0.01}
        onChange={(fade) => change({ fade })}
      />
      {modes.length > 1 && (
        <Segmented
          label={`In ${modes
            .slice(1)
            .map((m) => m.name)
            .join(", ")}`}
          value={draft.other}
          options={[
            { value: "flip", label: "Flipped" },
            { value: "same", label: "Same" },
          ]}
          onChange={(other) => change({ other })}
        />
      )}
      <ShadeStrips draft={draft} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>
          {draft.id ? "Update shades" : `Create ${SHADE_STEPS[draft.steps].length} shades`}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
          Cancel
        </Button>
      </div>
      {draft.id && (
        <button
          type="button"
          className="text-left text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (draft.id) tokens.removeGenerator(draft.id);
            setDraft(null);
          }}
        >
          Stop generating (keep the colors)
        </button>
      )}
      <p className="text-xs text-subtle-foreground">
        The shades stay linked to the base: change it and they follow. Unlink one to tune it by
        hand.
      </p>
    </div>
  );
}
