import { LayoutGrid } from "lucide-react";

import type { BrochureArrange } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { useBrochure } from "../hooks/use-brochure";
import { SettingSelect } from "./setting-select";
import type { SettingChoice } from "./sidebar.types";

const ARRANGES: readonly SettingChoice<BrochureArrange>[] = [
  { value: "off", label: "Don't arrange the canvas" },
  { value: "below", label: "Arrange · options below each page" },
  { value: "beside", label: "Arrange · options beside each page" },
];

/**
 * How the brochure's frames sit on the canvas: kept arranged after every edit (the printed pages
 * on one line by spread, the other options below or beside them) or left alone, and a button to
 * tidy them now.
 */
export function ArrangeFields() {
  const { brochure, settings, pages } = useBrochure();

  return (
    <div className="flex flex-col gap-1.5">
      <SettingSelect
        label="Arrange on canvas"
        value={settings.arrange}
        choices={ARRANGES}
        onChange={(arrange) => brochure?.setSettings({ arrange })}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={!brochure || pages.length === 0}
        onClick={() => brochure?.arrange()}
      >
        <LayoutGrid />
        Arrange now
      </Button>
    </div>
  );
}
