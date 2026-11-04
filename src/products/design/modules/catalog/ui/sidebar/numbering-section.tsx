import { Hash } from "lucide-react";

import { NumberField, PanelSection } from "@design/ui/components/panel";
import { CheckboxField, SelectField } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

const STYLE_CHOICES = [
  { value: "arabic", label: t("numbering.arabic") },
  { value: "roman-lower", label: t("numbering.romanLower") },
  { value: "roman-upper", label: t("numbering.romanUpper") },
] as const;

const COVER_CHOICES = [
  { value: "hidden", label: t("numbering.covers.hidden") },
  { value: "numbered", label: t("numbering.covers.numbered") },
  { value: "uncounted", label: t("numbering.covers.uncounted") },
] as const;

/** The choice for no default master. */
const NO_MASTER = "none";

/**
 * How the brochure's pages are numbered (the first number, the style, how covers count) and
 * which master its pages show unless they pick one, on covers too or not.
 */
export function NumberingSection() {
  const { brochure, settings, masters } = useBrochure();
  if (!brochure) return null;
  const { numbering } = settings;
  const covers = settings.layout === "book" && settings.covers !== "none";

  return (
    <PanelSection title={t("numbering.title")}>
      <div className="flex flex-col gap-2">
        <NumberField
          prefix={<Hash className="size-3.5" />}
          label={t("numbering.start")}
          value={numbering.start}
          min={0}
          onCommit={(start) => brochure.masters.setNumbering({ start: Math.round(start) })}
        />
        <SelectField
          label={t("numbering.style")}
          layout="inline"
          value={numbering.style}
          options={STYLE_CHOICES}
          onChange={(style) => brochure.masters.setNumbering({ style })}
        />
        {covers && (
          <SelectField
            label={t("numbering.covers.label")}
            layout="inline"
            value={numbering.covers}
            options={COVER_CHOICES}
            onChange={(value) => brochure.masters.setNumbering({ covers: value })}
          />
        )}
        {masters.length > 0 && (
          <SelectField
            label={t("numbering.defaultMaster")}
            layout="inline"
            value={settings.defaultMaster ?? NO_MASTER}
            options={[
              ...masters.map((master) => ({ value: master.id, label: master.name })),
              { value: NO_MASTER, label: t("numbering.noMaster") },
            ]}
            onChange={(id) => brochure.setSettings({ defaultMaster: id === NO_MASTER ? null : id })}
          />
        )}
        {masters.length > 0 && covers && (
          <CheckboxField
            label={t("numbering.mastersOnCovers")}
            checked={settings.mastersOnCovers}
            onChange={(mastersOnCovers) => brochure.setSettings({ mastersOnCovers })}
          />
        )}
      </div>
    </PanelSection>
  );
}
