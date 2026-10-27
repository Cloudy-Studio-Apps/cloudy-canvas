import { useDocumentTokens } from "@canvas-ui";
import { SCALE_RATIOS, type FontWeight } from "@canvas";
import { FONT_WEIGHTS } from "@shared/core";
import { Field, Input, SelectField } from "@shared/ui/kit";
import { FontPicker } from "../../../text/ui";
import { NumberFieldRow } from "./number-field-row";
import type { TypeScaleFormProps } from "./type-scale-ui.types";
import { t } from "../../variables.i18n";

/** The value of the font select that means "a family by name". */
const BY_NAME = "__name__";

/** A type scale's settings: where it goes, its sizes, its font, weights and line heights. */
export function TypeScaleForm({ settings, onChange }: TypeScaleFormProps) {
  const { store } = useDocumentTokens();
  const set = (patch: Partial<typeof settings>) => onChange({ ...settings, ...patch });
  const fontVariables = store
    .variables()
    .filter((v) => v.type === "string" && v.scopes.includes("font-family"));
  const weights = FONT_WEIGHTS.map((w) => ({ value: w, label: w }));
  const fontValue = "variable" in settings.font ? settings.font.variable : BY_NAME;

  return (
    <div className="flex flex-col gap-2">
      <SelectField
        layout="inline"
        label={t("typeScale.collection")}
        value={settings.collection}
        options={store.collections().map((c) => ({ value: c.id, label: c.name }))}
        onChange={(collection) => set({ collection })}
      />
      <Field label={t("typeScale.group")} layout="inline">
        <Input
          aria-label={t("typeScale.group")}
          className="h-7 text-xs"
          value={settings.group}
          onChange={(event) => set({ group: event.target.value })}
        />
      </Field>
      <NumberFieldRow
        label={t("typeScale.baseSize")}
        value={settings.base}
        min={8}
        max={64}
        onChange={(base) => set({ base })}
      />
      <SelectField
        layout="inline"
        label={t("typeScale.ratio")}
        value={String(settings.ratio)}
        options={SCALE_RATIOS.map((r) => ({
          value: String(r.ratio),
          label: `${r.label} · ${r.ratio}`,
        }))}
        onChange={(ratio) => set({ ratio: Number(ratio) })}
      />
      <NumberFieldRow
        label={t("typeScale.stepsBelow")}
        value={settings.below}
        min={0}
        max={5}
        onChange={(below) => set({ below })}
      />
      <NumberFieldRow
        label={t("typeScale.stepsAbove")}
        value={settings.above}
        min={0}
        max={7}
        onChange={(above) => set({ above })}
      />
      <SelectField
        layout="inline"
        label={t("typeScale.font")}
        value={fontValue}
        options={[
          ...fontVariables.map((v) => ({
            value: v.id,
            label: t("typeScale.fontVariable", { name: v.name }),
          })),
          { value: BY_NAME, label: t("typeScale.aFamily") },
        ]}
        onChange={(value) =>
          set({ font: value === BY_NAME ? { name: "Inter" } : { variable: value } })
        }
      />
      {"name" in settings.font && (
        <FontPicker
          family={settings.font.name}
          onPick={(font) => set({ font: { name: font.family } })}
        />
      )}
      <SelectField
        layout="inline"
        label={t("typeScale.headingWeight")}
        value={settings.headingWeight}
        options={weights}
        onChange={(w) => set({ headingWeight: w as FontWeight })}
      />
      <SelectField
        layout="inline"
        label={t("typeScale.bodyWeight")}
        value={settings.bodyWeight}
        options={weights}
        onChange={(w) => set({ bodyWeight: w as FontWeight })}
      />
      <NumberFieldRow
        label={t("typeScale.headingLineHeight")}
        value={settings.lineHeight.heading}
        min={0.8}
        max={3}
        step={0.05}
        decimals={2}
        onChange={(heading) => set({ lineHeight: { ...settings.lineHeight, heading } })}
      />
      <NumberFieldRow
        label={t("typeScale.bodyLineHeight")}
        value={settings.lineHeight.body}
        min={0.8}
        max={3}
        step={0.05}
        decimals={2}
        onChange={(body) => set({ lineHeight: { ...settings.lineHeight, body } })}
      />
    </div>
  );
}
