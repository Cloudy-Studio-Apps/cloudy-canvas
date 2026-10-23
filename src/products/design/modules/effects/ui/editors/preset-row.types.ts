export interface PresetRowProps {
  label: string;
  presets: readonly { label: string }[];
  onPick: (index: number) => void;
}
