export interface FlagToggleProps {
  label: string;
  title: string;
  on: boolean;
  onToggle: () => void;
  /** Can't be turned on (the title says why); still shows its tooltip. */
  disabled?: boolean;
}
