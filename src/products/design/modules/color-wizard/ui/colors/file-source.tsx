import { useMemo } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, CheckboxField, EmptyState, SegmentedControl } from "@shared/ui/kit";
import { collectFills, mergeFills } from "../..";
import { takePalette, useColorWizardStore } from "../store";
import { FillGroupRow } from "./fill-group-row";
import { SectionLabel } from "./section-label";
import { t } from "../../color-wizard.i18n";

/** How alike two fills must look to merge (OKLab distance). */
const MERGE = [
  { value: "0", label: t("sources.file.off") },
  { value: "0.03", label: t("sources.file.close") },
  { value: "0.06", label: t("sources.file.similar") },
  { value: "0.1", label: t("sources.file.loose") },
] as const;

/** The colors the file's layers already use, near-duplicates merged, to become its palette. */
export function FileSource() {
  const engine = useDesignEngine();
  const merge = useColorWizardStore((s) => s.fileMerge);
  const selection = useColorWizardStore((s) => s.fileSelection);
  const bindFills = useColorWizardStore((s) => s.bindFills);
  const set = useColorWizardStore((s) => s.set);
  const fills = useMemo(() => collectFills(engine.doc), [engine]);
  const groups = useMemo(() => mergeFills(fills, merge), [fills, merge]);
  if (!groups.length) {
    return (
      <EmptyState
        className="p-8"
        title={t("sources.file.emptyTitle")}
        description={t("sources.file.emptyHint")}
      />
    );
  }
  const picked = selection ?? groups.slice(0, 6).map((g) => g.hex);
  const chosen = groups.filter((g) => picked.includes(g.hex));
  const uses = chosen.reduce((n, g) => n + g.count, 0);
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel aside={t("sources.file.summary", { from: fills.length, to: groups.length })}>
        {t("sources.file.title")}
      </SectionLabel>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs">{t("sources.file.mergeSimilar")}</span>
        <SegmentedControl
          label={t("sources.file.mergeSimilar")}
          size="sm"
          value={String(merge) as (typeof MERGE)[number]["value"]}
          options={MERGE}
          onChange={(value) => set({ fileMerge: Number(value) })}
        />
      </div>
      <div>
        {groups.map((g) => (
          <FillGroupRow
            key={g.hex}
            group={g}
            checked={picked.includes(g.hex)}
            onCheckedChange={(checked) =>
              set({
                fileSelection: checked ? [...picked, g.hex] : picked.filter((h) => h !== g.hex),
              })
            }
          />
        ))}
      </div>
      <CheckboxField
        label={t("sources.file.bind", { count: uses })}
        checked={bindFills}
        onChange={(checked) => set({ bindFills: checked })}
      />
      <Button
        disabled={chosen.length < 2}
        onClick={() =>
          takePalette(chosen.map((g) => ({ hex: g.hex, fills: g.members.flatMap((m) => m.refs) })))
        }
      >
        {t("sources.file.use", { count: chosen.length })}
      </Button>
    </div>
  );
}
