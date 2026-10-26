import type { TypeScaleStep } from "../../variables";

/** The wizard's text styles: a font pair and a modular scale. */
export interface WizardType {
  heading: string;
  body: string;
  /** The body size (px). */
  base: number;
  ratio: number;
}

/** A suggested font pair. */
export interface FontPair {
  heading: string;
  body: string;
  mood: string;
}

/** A step of the wizard's type scale, with the font it's set in. */
export interface WizardTypeStep extends TypeScaleStep {
  font: string;
}
