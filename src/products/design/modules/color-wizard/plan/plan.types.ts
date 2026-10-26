import type { ThemeOverrides, WizardOptions, WizardRole } from "../theme";
import type { WizardType, WizardTypeStep } from "../type";

/** Everything the wizard makes, as the UI and agents give it. */
export interface WizardInput {
  /** The palette's collection (made, or reused when one has the name). */
  collection: string;
  roles: WizardRole[];
  options: WizardOptions;
  overrides: ThemeOverrides;
  /** Text styles to make; `null` for none. */
  type: WizardType | null;
  /** Bind the layers' paints the colors were collected from to them. */
  bindFills: boolean;
}

/** A variable the wizard writes: what it shows per mode, and whether it exists already. */
export interface PlannedVariable {
  name: string;
  /** Per mode (one for a collection without modes): the variable it aliases, or the color. */
  aliases: string[];
  hexes: string[];
  action: "create" | "update";
}

export interface PlannedCollection {
  name: string;
  /** Its modes (`["Value"]` for one without). */
  modes: string[];
  variables: PlannedVariable[];
}

/** What the wizard will write, for its review. */
export interface WizardPlan {
  collections: PlannedCollection[];
  textStyles: WizardTypeStep[];
  /** How many paints get bound. */
  bindings: number;
  created: number;
  updated: number;
}

/** What the wizard wrote. */
export interface WizardResult {
  collection: string;
  created: number;
  updated: number;
  textStyles: number;
  bound: number;
}

/** A file's palette made by shade generators (what the wizard opens on to edit a system). */
export interface ExistingPalette {
  collectionId: string;
  collection: string;
  roles: { name: string; hex: string }[];
}
