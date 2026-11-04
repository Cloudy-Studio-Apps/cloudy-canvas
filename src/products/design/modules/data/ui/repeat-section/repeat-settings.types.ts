import type { RepeatSettings } from "../../repeat";
import type { ApplyRepeat } from "./use-set-repeat.types";

export interface RepeatSettingsProps {
  frameId: string;
  repeat: RepeatSettings;
  apply: ApplyRepeat;
}
