import { Plus } from "lucide-react";

import { IconButton, Section } from "@shared/ui/kit";
import type {
  PanelAddButtonProps,
  PanelIconButtonProps,
  PanelSectionProps,
} from "./panel-section.types";

/** A titled block in a side panel, separated from the next by a rule (the kit's `Section`). */
export function PanelSection(props: PanelSectionProps) {
  return <Section {...props} />;
}

/** Small square icon button used in panel headers and rows (the kit's `IconButton`, `xs`). */
export function PanelIconButton({
  label,
  children,
  active,
  disabled,
  onClick,
}: PanelIconButtonProps) {
  return (
    <IconButton size="xs" label={label} active={active} disabled={disabled} onClick={onClick}>
      {children}
    </IconButton>
  );
}

/** The "+" in a section header that adds an item (a fill, a stroke). */
export function PanelAddButton({ label, onClick }: PanelAddButtonProps) {
  return (
    <PanelIconButton label={label} onClick={onClick}>
      <Plus />
    </PanelIconButton>
  );
}
