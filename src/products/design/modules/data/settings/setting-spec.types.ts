/** One setting a source type or format asks for. Labels are already translated strings. */
export type SettingSpec =
  | {
      key: string;
      kind: "text" | "url" | "multiline";
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | { key: string; kind: "number"; label: string; min?: number; max?: number }
  | { key: string; kind: "boolean"; label: string }
  | { key: string; kind: "select"; label: string; options: { value: string; label: string }[] }
  /** Headers: name → value. */
  | { key: string; kind: "pairs"; label: string; secretValues?: boolean }
  | { key: string; kind: "file"; label: string; extensions: string[] }
  | { key: string; kind: "secret"; label: string; required?: boolean };
