import { DropdownMenuItem, DropdownMenuLabel } from "@ui/components/ui/dropdown-menu";
import { useEngine } from "../engine/engine-context";
import { useContentQuery } from "../engine/use-content-query";

/** Only mounted while the menu is open, so it doesn't re-read on every edit otherwise. */
export function SectionsMenuItems() {
  const engine = useEngine();
  const sections = useContentQuery((e) => e.sections());

  return (
    <>
      <DropdownMenuLabel>Sections</DropdownMenuLabel>
      {sections.length === 0 && (
        <p className="px-2 pb-2 text-sm text-muted-foreground">
          No sections yet. Use the Section tool to add one.
        </p>
      )}
      {sections.map((section) => (
        <DropdownMenuItem key={section.id} onSelect={() => engine.zoomToShape(section.id)}>
          <span
            className="size-3 shrink-0 rounded-xs border border-black/10"
            style={{ backgroundColor: section.color }}
          />
          <span className="truncate">{section.text}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
}
