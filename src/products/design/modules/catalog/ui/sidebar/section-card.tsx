import { Hash, IndentDecrease, IndentIncrease, X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import type { BrochureSection } from "../../brochure/brochure.types";
import { NumberField, PanelIconButton } from "@design/ui/components/panel";
import { CheckboxField, Field, SelectField } from "@shared/ui/kit";
import { patchSection } from "../../model/sections";
import { useBrochure } from "../hooks/use-brochure";
import { canShift, removeSection, shiftSection } from "../section-actions";
import type { SectionCardProps } from "./sidebar.types";
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
 * A section starting on the page: its level (in and out, with its subsections), name (its
 * pages' `{section}`), where its numbering restarts and how its numbers are written, and ×.
 */
export function SectionCard({ section, depth, side }: SectionCardProps) {
  const { brochure, sections, numbers } = useBrochure();
  if (!brochure) return null;
  // A field set to `undefined` is taken out (restart, style), so the record holds no gaps.
  const update = (patch: Partial<BrochureSection>) =>
    brochure.masters.setSections(
      patchSection(sections, section.id, patch).map((item) =>
        item.id === section.id ? withoutGaps(item) : item,
      ),
    );

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-2">
      <div className="flex items-center gap-0.5">
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
          {depth === 0 ? t("section.levelTop") : t("section.level", { n: depth })}
        </span>
        <PanelIconButton
          label={t("tab.folder.outdent")}
          disabled={!canShift(brochure, section.id, -1)}
          onClick={() => shiftSection(brochure, section.id, -1)}
        >
          <IndentDecrease />
        </PanelIconButton>
        <PanelIconButton
          label={t("tab.folder.indent")}
          disabled={!canShift(brochure, section.id, 1)}
          onClick={() => shiftSection(brochure, section.id, 1)}
        >
          <IndentIncrease />
        </PanelIconButton>
        <PanelIconButton
          label={t("tab.folder.remove")}
          onClick={() => removeSection(brochure, section.id)}
        >
          <X />
        </PanelIconButton>
      </div>
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
    </div>
  );
}

/** `section` without the fields set to `undefined`. */
function withoutGaps(section: BrochureSection): BrochureSection {
  const next = { ...section };
  if (next.restart === undefined) delete next.restart;
  if (next.style === undefined) delete next.style;
  return next;
}
