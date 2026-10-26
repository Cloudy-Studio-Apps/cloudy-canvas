import type { BrochureCovers, BrochureLayout } from "../../brochure/brochure.types";
import { useBrochure } from "../hooks/use-brochure";
import { CheckboxField, SelectField, type SelectOption } from "@shared/ui/kit";

const LAYOUTS: readonly SelectOption<BrochureLayout>[] = [
  { value: "book", label: "Book · facing pages" },
  { value: "single", label: "Single pages" },
];

const COVERS: readonly SelectOption<BrochureCovers>[] = [
  { value: "both", label: "Front and back covers" },
  { value: "front", label: "Front cover only" },
  { value: "back", label: "Back cover only" },
  { value: "none", label: "No covers" },
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
        label="Layout"
        value={settings.layout}
        options={LAYOUTS}
        onChange={(layout) => brochure?.setSettings({ layout })}
      />
      {settings.layout === "book" && (
        <SelectField
          label="Covers"
          value={settings.covers}
          options={COVERS}
          onChange={(covers) => brochure?.setSettings({ covers })}
        />
      )}
      <CheckboxField
        label="Split spreads into pages in the PDF"
        checked={settings.splitSpreads}
        onChange={(splitSpreads) => brochure?.setSettings({ splitSpreads })}
      />
    </div>
  );
}
