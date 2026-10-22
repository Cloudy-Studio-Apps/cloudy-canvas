import { PanelSection } from "@design/ui/components/panel";

/** The Prototype tab, until interactions exist. */
export function PrototypeSection() {
  return (
    <PanelSection title="Interactions">
      <p className="text-xs text-muted-foreground">
        Links between frames and transitions come in a later version.
      </p>
    </PanelSection>
  );
}
