import type { CodeOptionValue, CodeTargetDefinition } from "../targets";

export interface TargetFieldsProps {
  targets: readonly CodeTargetDefinition[];
  target: CodeTargetDefinition;
  profile: string;
  options: Readonly<Record<string, CodeOptionValue>>;
  onTarget: (id: string) => void;
  onProfile: (id: string) => void;
  onOption: (id: string, value: CodeOptionValue) => void;
}
