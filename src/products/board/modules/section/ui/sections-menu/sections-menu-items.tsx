import { useState } from "react";

import { boardSections } from "../../section-members";
import { useEngine } from "@canvas-ui";
import { DropdownMenuItem, DropdownMenuLabel } from "@shared/ui/components/ui/dropdown-menu";

/** Only mounted while the menu is open, so it reads the sections once per opening. */
export function SectionsMenuItems() {
  const engine = useEngine();
  const [sections] = useState(() => boardSections(engine.elements()));

  return (
    <>
      <DropdownMenuLabel>Sections</DropdownMenuLabel>
      {sections.length === 0 && (
        <p className="px-2 pb-2 text-sm text-muted-foreground">
          No sections yet. Use the Section tool to add one.
        </p>
      )}
      {sections.map((section) => (
        <DropdownMenuItem key={section.id} onSelect={() => engine.zoomToElement(section.id)}>
          <span
            className="size-3 shrink-0 rounded-xs border border-border"
            style={{ backgroundColor: section.color }}
          />
          <span className="truncate">{section.text}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
}
