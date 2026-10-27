import type { BrochureCovers, BrochureLayout } from "../../brochure/brochure.types";
import { useBrochure } from "../hooks/use-brochure";
import { CheckboxField, SelectField, type SelectOption } from "@shared/ui/kit";
import { t } from "../../catalog.i18n";

const LAYOUTS: readonly SelectOption<BrochureLayout>[] = [
  { value: "book", label: t("layout.book") },
  { value: "single", label: t("layout.single") },
];

const COVERS: readonly SelectOption<BrochureCovers>[] = [
  { value: "both", label: t("layout.covers.both") },
  { value: "front", label: t("layout.covers.front") },
  { value: "back", label: t("layout.covers.back") },
  { value: "none", label: t("layout.covers.none") },
];

/**
 * How the brochure is bound: a book of facing pages (with its covers) or single pages, and
 * whether spread frames print as two pages.
 */
export function LayoutFields() {
  const { brochure, settings } = useBrochure();

  return (
    <div className="flex flex-col gap-1.5">
      <SelectField
        label={t("layout.label")}
        value={settings.layout}
        options={LAYOUTS}
        onChange={(layout) => brochure?.setSettings({ layout })}
      />
      {settings.layout === "book" && (
        <SelectField
          label={t("layout.covers.label")}
          value={settings.covers}
          options={COVERS}
          onChange={(covers) => brochure?.setSettings({ covers })}
        />
      )}
      <CheckboxField
        label={t("layout.splitSpreads")}
        checked={settings.splitSpreads}
        onChange={(splitSpreads) => brochure?.setSettings({ splitSpreads })}
      />
    </div>
  );
}
