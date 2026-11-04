export interface SecretInputProps {
  label: string;
  value: string;
  /** This device keeps a value: left empty, it stays. */
  stored: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}
