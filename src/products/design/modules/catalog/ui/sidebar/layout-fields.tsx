import type { BrochureCovers, BrochureLayout } from "../../brochure/brochure.types";
import { useBrochure } from "../hooks/use-brochure";
import { SettingSelect } from "./setting-select";
import type { SettingChoice } from "./sidebar.types";
import { Toggle } from "./toggle";

const LAYOUTS: readonly SettingChoice<BrochureLayout>[] = [
  { value: "book", label: "Book · facing pages" },
  { value: "single", label: "Single pages" },
];

const COVERS: readonly SettingChoice<BrochureCovers>[] = [
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
      <SettingSelect
        label="Layout"
        value={settings.layout}
        choices={LAYOUTS}
        onChange={(layout) => brochure?.setSettings({ layout })}
      />
      {settings.layout === "book" && (
        <SettingSelect
          label="Covers"
          value={settings.covers}
          choices={COVERS}
          onChange={(covers) => brochure?.setSettings({ covers })}
        />
      )}
      <Toggle
        label="Split spreads into pages in the PDF"
        checked={settings.splitSpreads}
        onChange={(splitSpreads) => brochure?.setSettings({ splitSpreads })}
      />
    </div>
  );
}
