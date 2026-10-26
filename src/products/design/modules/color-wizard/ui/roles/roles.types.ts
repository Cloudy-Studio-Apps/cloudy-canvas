import type { WizardColor, WizardOptions, WizardRole } from "../..";

export interface ShadeStripProps {
  hex: string;
  /** The variable group, for the tooltips (`primary/500`). */
  group: string;
  /** Shades (default) or the color alone. */
  shades: boolean;
}

export interface RoleRowProps {
  role: WizardRole;
  index: number;
  /** Whether the file has this group already (it's updated in place). */
  exists: boolean;
}

export interface AddedRowProps {
  color: WizardColor;
  exists: boolean;
}

/** A palette option with what it does. */
export interface RoleOption {
  key: keyof Omit<WizardOptions, "modes" | "theme">;
  label: string;
  hint: string;
}
