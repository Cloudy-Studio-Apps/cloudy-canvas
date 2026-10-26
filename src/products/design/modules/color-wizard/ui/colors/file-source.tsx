import { useMemo } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, CheckboxField, EmptyState, SegmentedControl } from "@shared/ui/kit";
import { collectFills, mergeFills } from "../..";
import { takePalette, useColorWizardStore } from "../store";
import { FillGroupRow } from "./fill-group-row";
import { SectionLabel } from "./section-label";

/** How alike two fills must look to merge (OKLab distance). */
const MERGE = [
  { value: "0", label: "Off" },
  { value: "0.03", label: "Close" },
  { value: "0.06", label: "Similar" },
  { value: "0.1", label: "Loose" },
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
        title="No colors on layers yet"
        description="Colors your layers paint without a variable show here, ready to become the palette."
      />
    );
  }
  const picked = selection ?? groups.slice(0, 6).map((g) => g.hex);
  const chosen = groups.filter((g) => picked.includes(g.hex));
  const uses = chosen.reduce((n, g) => n + g.count, 0);
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel aside={`${fills.length} colors → ${groups.length}`}>
        Colors on layers
      </SectionLabel>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs">Merge similar colors</span>
        <SegmentedControl
          label="Merge similar colors"
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
        label={`Bind these ${uses} paints to the new variables`}
        checked={bindFills}
        onChange={(checked) => set({ bindFills: checked })}
      />
      <Button
        disabled={chosen.length < 2}
        onClick={() =>
          takePalette(chosen.map((g) => ({ hex: g.hex, fills: g.members.flatMap((m) => m.refs) })))
        }
      >
        Use {chosen.length} colors
      </Button>
    </div>
  );
}
