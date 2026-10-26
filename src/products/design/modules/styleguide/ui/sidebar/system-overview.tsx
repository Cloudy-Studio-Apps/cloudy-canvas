import { FileDown } from "lucide-react";

import { STYLEGUIDE_COMMANDS } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, Section } from "@shared/ui/kit";
import { useStyleguideOutline } from "../hooks/use-styleguide";
import { useSystemPage } from "../hooks/use-system-page";
import { ModesSwitch } from "./modes-switch";

/** The Design system view's own settings and export, when no section is picked. */
export function SystemOverview() {
  const engine = useDesignEngine();
  const page = useSystemPage();
  const shown = useStyleguideOutline().filter((entry) => entry.sheetId);
  if (!page) {
    return (
      <p className="px-3 py-2.5 text-xs text-muted-foreground">
        Add variables or styles to see them here as a style guide.
      </p>
    );
  }
  return (
    <Section title="Design system">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          {shown.length} sections, kept up to date as your variables and styles change. Pick one in
          the left panel or on the canvas to choose how it&apos;s drawn.
        </p>
        <ModesSwitch />
        <Button size="sm" onClick={() => engine.runHostAction(STYLEGUIDE_COMMANDS.exportSystem)}>
          <FileDown />
          Export as PDF
        </Button>
      </div>
    </Section>
  );
}
