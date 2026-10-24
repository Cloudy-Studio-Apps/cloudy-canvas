import { PanelSection } from "@design/ui/components/panel";

/** What the sidebar says while frames are being picked. */
export function PickSection() {
  return (
    <PanelSection title="Picking frames">
      <p className="text-xs text-muted-foreground">
        Click frames on the canvas to tick them, or drag a box round a whole row. Pages already in
        the brochure start ticked.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        New pages go in reading order (rows top to bottom, left to right); drag them in the list to
        fine-tune. Esc cancels.
      </p>
    </PanelSection>
  );
}
