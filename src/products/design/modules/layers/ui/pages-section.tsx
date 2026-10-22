import { PanelAddButton, PanelSection } from "@design/ui/components/panel";

/** The design's pages. One page for now; adding pages comes in a later version. */
export function PagesSection() {
  return (
    <PanelSection
      title="Pages"
      className="shrink-0 border-t border-b-0"
      actions={<PanelAddButton label="Add page (coming soon)" />}
    >
      <ul className="flex flex-col gap-px">
        <li className="flex h-7 items-center rounded-sm bg-muted px-2 text-sm font-medium text-foreground">
          Page 1
        </li>
      </ul>
    </PanelSection>
  );
}
