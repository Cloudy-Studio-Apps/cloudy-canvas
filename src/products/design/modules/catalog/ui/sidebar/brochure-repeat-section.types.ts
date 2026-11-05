import type { BrochureRepeat, RepeatTarget } from "../../model/repeats";
import type { BrochureRepeatState } from "../hooks/use-brochure-repeat.types";

export interface BrochureRepeatSectionProps {
  /** The section ("Repeat for each row") or page ("Repeat this page") it sets. */
  target: RepeatTarget;
}

export interface BrochureRepeatStartProps {
  state: BrochureRepeatState;
}

export interface BrochureRepeatSettingsProps {
  state: BrochureRepeatState;
  repeat: BrochureRepeat;
}
