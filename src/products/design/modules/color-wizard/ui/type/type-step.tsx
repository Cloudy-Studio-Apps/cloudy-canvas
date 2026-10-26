import { useMemo } from "react";

import { CheckboxField, cn, Field, NumberInput, SelectableCard, SelectField } from "@shared/ui/kit";
import { FONT_PAIRS, themeColor, TYPE_RATIOS, wizardTypeSteps } from "../..";
import { FontPicker } from "../../../text/ui";
import { useColorWizardStore, useWizardTheme } from "../store";
import { TypeSampleRow } from "./type-sample-row";
import { usePreviewFonts } from "./use-preview-fonts";

/** Step 4: text styles from a font pair and a modular scale, shown in the theme's text colors. */
export function TypeStep() {
  const type = useColorWizardStore((s) => s.type);
  const set = useColorWizardStore((s) => s.set);
  const { theme } = useWizardTheme();
  const steps = useMemo(() => wizardTypeSteps(type), [type]);
  usePreviewFonts([type.heading, type.body, ...FONT_PAIRS.flatMap((p) => [p.heading, p.body])]);
  const mode = theme.modes[0] ?? "Light";
  const color = themeColor(theme, "foreground", mode) ?? "inherit";
  const muted = themeColor(theme, "muted-foreground", mode) ?? "inherit";
  const change = (patch: Partial<typeof type>) => set({ type: { ...type, ...patch } });
  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-auto md:grid-cols-[minmax(0,1fr)_320px] md:overflow-hidden">
      <div className={cn("overflow-auto px-4 py-3.5", !type.enabled && "opacity-45")}>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Text styles
          </span>
          <span className="text-xs text-muted-foreground">In the theme's text colors</span>
        </div>
        {[...steps].reverse().map((step) => (
          <TypeSampleRow key={step.name} step={step} color={color} muted={muted} />
        ))}
      </div>
      <aside className="flex flex-col gap-3.5 overflow-auto border-t border-border px-4 py-3.5 md:border-t-0 md:border-l">
        <CheckboxField
          label="Create text styles"
          checked={type.enabled}
          onChange={(enabled) => change({ enabled })}
        />
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Pairings
        </span>
        <div className="grid grid-cols-2 gap-2">
          {FONT_PAIRS.map((pair) => (
            <SelectableCard
              key={`${pair.heading}-${pair.body}`}
              selected={type.heading === pair.heading && type.body === pair.body}
              onSelect={() => change({ heading: pair.heading, body: pair.body })}
              title={
                <span style={{ fontFamily: `"${pair.heading}"` }} className="text-[15px]">
                  {pair.heading}
                </span>
              }
              description={
                <span style={{ fontFamily: `"${pair.body}"` }}>
                  {pair.body} · {pair.mood}
                </span>
              }
            />
          ))}
        </div>
        <Field label="Headings">
          <FontPicker family={type.heading} onPick={(font) => change({ heading: font.family })} />
        </Field>
        <Field label="Body">
          <FontPicker family={type.body} onPick={(font) => change({ body: font.family })} />
        </Field>
        <SelectField
          label="Scale"
          layout="stacked"
          value={String(type.ratio)}
          options={TYPE_RATIOS.map((r) => ({
            value: String(r.value),
            label: `${r.label} · ${r.value}`,
          }))}
          onChange={(value) => change({ ratio: Number(value) })}
        />
        <Field label="Body size" layout="inline">
          <NumberInput
            label="Body size"
            value={type.base}
            min={12}
            max={22}
            suffix="px"
            decimals={0}
            onChange={(base) => change({ base })}
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          Sizes are body × ratio<sup>step</sup>, kept as a scale: change its base later and every
          style follows.
        </p>
      </aside>
    </div>
  );
}
