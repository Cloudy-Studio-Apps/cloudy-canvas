export interface TypeOption {
  name: string;
  kind: "enum" | "type";
  /** Extra info shown on the right, e.g. "3 values". */
  detail?: string;
}

export interface TypeOptionListProps {
  options: TypeOption[];
  current: string;
  onPick: (type: string) => void;
}
