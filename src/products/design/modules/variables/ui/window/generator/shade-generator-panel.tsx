import { X } from "lucide-react";

import { SHADE_STEPS, type GeneratorInput, type ShadeSteps } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { tCommon } from "@shared/core";
import { Button } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { joinPath } from "../group-paths";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { BaseColorField } from "./base-color-field";
import { GeneratorSlider } from "./generator-slider";
import { Segmented } from "./segmented";
import type { ShadeGeneratorPanelProps } from "./generator.types";
import { ShadeStrips } from "./shade-strips";
import { t } from "../../../variables.i18n";

const STEPS: { value: ShadeSteps; label: string }[] = [
  { value: "50-950", label: "50–950" },
  { value: "100-900", label: "100–900" },
  { value: "5", label: t("generator.steps5") },
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
      notifyError(t("generator.shadesError"), error);
    }
  };
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {draft.id ? t("generator.editShades") : t("generator.generateShades")}
        </h3>
        <button
          type="button"
          aria-label={tCommon("cancel")}
          onClick={() => setDraft(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <BaseColorField draft={draft} change={change} />
      <label className="flex flex-col gap-1.5 text-xs">
        <span className="text-muted-foreground">{t("generator.groupName")}</span>
        <CommitInput
          aria-label={t("generator.groupName")}
          value={draft.group}
          onCommit={(group) => change({ group })}
          className="h-7 text-xs"
        />
      </label>
      <Segmented
        label={t("generator.steps")}
        value={draft.steps}
        options={STEPS}
        onChange={(steps) => change({ steps })}
      />
      <GeneratorSlider
        label={t("generator.lightest")}
        value={draft.lightest}
        min={0.8}
        max={0.99}
        step={0.005}
        onChange={(lightest) => change({ lightest })}
      />
      <GeneratorSlider
        label={t("generator.darkest")}
        value={draft.darkest}
        min={0.1}
        max={0.45}
        step={0.005}
        onChange={(darkest) => change({ darkest })}
      />
      <GeneratorSlider
        label={t("generator.soften")}
        value={draft.fade}
        min={0}
        max={1}
        step={0.01}
        onChange={(fade) => change({ fade })}
      />
      {modes.length > 1 && (
        <Segmented
          label={t("generator.inModes", {
            modes: modes
              .slice(1)
              .map((m) => m.name)
              .join(", "),
          })}
          value={draft.other}
          options={[
            { value: "flip", label: t("generator.flipped") },
            { value: "same", label: t("generator.same") },
          ]}
          onChange={(other) => change({ other })}
        />
      )}
      <ShadeStrips draft={draft} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>
          {draft.id
            ? t("generator.updateShades")
            : t("generator.createShades", { count: SHADE_STEPS[draft.steps].length })}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
          {tCommon("cancel")}
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
          {t("generator.stopGenerating")}
        </button>
      )}
      <p className="text-xs text-subtle-foreground">{t("generator.shadesLinked")}</p>
    </div>
  );
}
