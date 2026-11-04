import { Hash } from "lucide-react";
import { createId } from "@shared/core";

import { CommitInput } from "@canvas-ui";
import type { BrochureSection } from "../../brochure/brochure.types";
import { NumberField } from "@design/ui/components/panel";
import { CheckboxField, Field, SelectField } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { nextSectionName } from "../page-actions";
import type { SectionFieldsProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/** The choice for a section that keeps the numbers' style. */
const SAME = "same";

const STYLE_CHOICES = [
  { value: SAME, label: t("section.styleSame") },
  { value: "arabic", label: t("numbering.arabic") },
  { value: "roman-lower", label: t("numbering.romanLower") },
  { value: "roman-upper", label: t("numbering.romanUpper") },
] as const;

/**
 * Whether a section starts at the page, and that section's name (its pages' `{section}`), where
 * its numbering restarts and how its numbers are written.
 */
export function SectionFields({ page }: SectionFieldsProps) {
  const { brochure, sections, numbers, layout } = useBrochure();
  if (!brochure) return null;
  const section = sections.find((item) => item.start === page.slot.id);
  const side = layout.sides.findIndex(
    (item) => item.kind === "page" && item.page.slot.id === page.slot.id,
  );
  const current = numbers[side]?.section ?? null;
  // A field set to `undefined` is taken out (restart, style), so the record holds no gaps.
  const update = (patch: Partial<BrochureSection>) =>
    brochure.masters.setSections(
      sections.map((item) => (item.id === section?.id ? patched(item, patch) : item)),
    );

  const toggle = (on: boolean) => {
    if (!on) {
      brochure.masters.setSections(sections.filter((item) => item.id !== section?.id));
      return;
    }
    const name = nextSectionName(sections);
    brochure.masters.setSections([...sections, { id: createId(), name, start: page.slot.id }]);
  };

  return (
    <div className="flex flex-col gap-2">
      <CheckboxField label={t("section.start")} checked={!!section} onChange={toggle} />
      {!section && (
        <p className="text-xs text-muted-foreground">
          {current ? t("section.in", { name: current.name }) : t("section.none")}
        </p>
      )}
      {section && (
        <>
          <Field label={t("section.name")} layout="stacked">
            {(id) => (
              <CommitInput
                id={id}
                value={section.name}
                onCommit={(name) => {
                  if (name.trim()) update({ name: name.trim() });
                }}
              />
            )}
          </Field>
          <CheckboxField
            label={t("section.restart")}
            checked={section.restart !== undefined}
            onChange={(on) => update({ restart: on ? (numbers[side]?.number ?? 1) : undefined })}
          />
          {section.restart !== undefined && (
            <NumberField
              prefix={<Hash className="size-3.5" />}
              label={t("section.restartAt")}
              value={section.restart}
              min={0}
              onCommit={(restart) => update({ restart: Math.round(restart) })}
            />
          )}
          <SelectField
            label={t("section.style")}
            layout="inline"
            value={section.style ?? SAME}
            options={STYLE_CHOICES}
            onChange={(style) => update({ style: style === SAME ? undefined : style })}
          />
        </>
      )}
    </div>
  );
}

/** `section` with `patch`, leaving out the fields it sets to `undefined`. */
function patched(section: BrochureSection, patch: Partial<BrochureSection>): BrochureSection {
  const next: BrochureSection = { ...section, ...patch };
  if (next.restart === undefined) delete next.restart;
  if (next.style === undefined) delete next.style;
  return next;
}
