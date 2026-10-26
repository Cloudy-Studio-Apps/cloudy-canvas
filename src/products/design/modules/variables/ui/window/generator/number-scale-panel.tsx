import { X } from "lucide-react";

import type { ScaleInput } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { Button } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { NUMBER_KINDS } from "../group-kinds";
import { joinPath } from "../group-paths";
import { scaleDraftSteps } from "../scale-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { NumberScalePanelProps } from "./generator.types";
import { RatioField } from "./ratio-field";
import { ScaleBaseField } from "./scale-base-field";
import { ScaleStepsList } from "./scale-steps-list";
import { Segmented } from "./segmented";
import { StepCount } from "./step-count";

/**
 * The inspector while making a number scale: its base (md), the ratio between steps, how many
 * below and above, their names, rounding and what they're for, with the steps listed; the board
 * shows them as ghost cards.
 */
export function NumberScalePanel({ draft }: NumberScalePanelProps) {
  const { tokens } = useBoard();
  const { setScaleDraft, select } = useVariablesWindowStore();
  const change = (patch: Partial<ScaleInput>) => setScaleDraft({ ...draft, ...patch });
  const kind =
    NUMBER_KINDS.find((k) => k.scopes.some((s) => draft.scopes.includes(s)))?.id ?? "other";
  const save = () => {
    try {
      const scale = tokens.saveScale(draft);
      const baseName = scaleDraftSteps(tokens.store(), draft).find((step) => step.base)?.name ?? "";
      const base = tokens.store().byPath(scale.collectionId, joinPath(scale.group, baseName));
      select(base?.id ?? scale.baseVar);
    } catch (error) {
      notifyError("Couldn't make the scale", error);
    }
  };
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{draft.id ? "Edit scale" : "Make a scale"}</h3>
        <button
          type="button"
          aria-label="Cancel"
          onClick={() => setScaleDraft(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <ScaleBaseField draft={draft} change={change} />
      <label className="flex flex-col gap-1.5 text-xs">
        <span className="text-muted-foreground">Group name</span>
        <CommitInput
          aria-label="Group name"
          value={draft.group}
          onCommit={(group) => change({ group })}
          className="h-7 text-xs"
        />
      </label>
      <RatioField draft={draft} change={change} />
      <StepCount
        label="Steps below"
        value={draft.below}
        max={5}
        onChange={(below) => change({ below })}
      />
      <StepCount
        label="Steps above"
        value={draft.above}
        max={7}
        onChange={(above) => change({ above })}
      />
      <Segmented
        label="Names"
        value={draft.names}
        options={[
          { value: "tshirt", label: "xs … 3xl" },
          { value: "numeric", label: "100 … 900" },
        ]}
        onChange={(names) => change({ names })}
      />
      <Segmented
        label="Values"
        value={draft.round ? "round" : "exact"}
        options={[
          { value: "round", label: "Whole numbers" },
          { value: "exact", label: "Exact" },
        ]}
        onChange={(value) => change({ round: value === "round" })}
      />
      <Segmented
        label="Used for"
        value={kind}
        options={NUMBER_KINDS.filter((k) => k.id !== "other" && k.id !== "opacity").map((k) => ({
          value: k.id,
          label: k.label.split(" ")[0] ?? k.label,
        }))}
        onChange={(id) => change({ scopes: NUMBER_KINDS.find((k) => k.id === id)?.scopes ?? [] })}
      />
      <ScaleStepsList draft={draft} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>
          {draft.id ? "Update scale" : `Create ${draft.below + draft.above + 1} steps`}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setScaleDraft(null)}>
          Cancel
        </Button>
      </div>
      {draft.id && (
        <button
          type="button"
          className="text-left text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (draft.id) tokens.removeGenerator(draft.id);
            setScaleDraft(null);
          }}
        >
          Stop the scale (keep the numbers)
        </button>
      )}
      <p className="text-xs text-subtle-foreground">
        The steps stay linked to the base: change it and they follow. Unlink one to tune it by hand.
      </p>
    </div>
  );
}
