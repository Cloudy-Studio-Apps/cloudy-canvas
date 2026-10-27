import { X } from "lucide-react";

import type { ScaleInput } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { tCommon } from "@shared/core";
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
import { t } from "../../../variables.i18n";

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
      notifyError(t("generator.scaleError"), error);
    }
  };
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {draft.id ? t("generator.editScale") : t("generator.makeScale")}
        </h3>
        <button
          type="button"
          aria-label={tCommon("cancel")}
          onClick={() => setScaleDraft(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <ScaleBaseField draft={draft} change={change} />
      <label className="flex flex-col gap-1.5 text-xs">
        <span className="text-muted-foreground">{t("generator.groupName")}</span>
        <CommitInput
          aria-label={t("generator.groupName")}
          value={draft.group}
          onCommit={(group) => change({ group })}
          className="h-7 text-xs"
        />
      </label>
      <RatioField draft={draft} change={change} />
      <StepCount
        label={t("generator.stepsBelow")}
        value={draft.below}
        max={5}
        onChange={(below) => change({ below })}
      />
      <StepCount
        label={t("generator.stepsAbove")}
        value={draft.above}
        max={7}
        onChange={(above) => change({ above })}
      />
      <Segmented
        label={t("generator.names")}
        value={draft.names}
        options={[
          { value: "tshirt", label: "xs … 3xl" },
          { value: "numeric", label: "100 … 900" },
        ]}
        onChange={(names) => change({ names })}
      />
      <Segmented
        label={t("generator.values")}
        value={draft.round ? "round" : "exact"}
        options={[
          { value: "round", label: t("generator.wholeNumbers") },
          { value: "exact", label: t("generator.exact") },
        ]}
        onChange={(value) => change({ round: value === "round" })}
      />
      <Segmented
        label={t("generator.usedFor")}
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
          {draft.id
            ? t("generator.updateScale")
            : t("generator.createSteps", { count: draft.below + draft.above + 1 })}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setScaleDraft(null)}>
          {tCommon("cancel")}
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
          {t("generator.stopScale")}
        </button>
      )}
      <p className="text-xs text-subtle-foreground">{t("generator.scaleLinked")}</p>
    </div>
  );
}
