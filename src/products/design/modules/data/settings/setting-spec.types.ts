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
  /** `default`: what it is while unset (off when left out). */
  | { key: string; kind: "boolean"; label: string; default?: boolean }
  | { key: string; kind: "select"; label: string; options: { value: string; label: string }[] }
  /** Headers: name → value. */
  | { key: string; kind: "pairs"; label: string; secretValues?: boolean }
  | { key: string; kind: "file"; label: string; extensions: string[] }
  /** A folder on this device (e.g. where the data's image files are); like a file, its path stays on the device. */
  | { key: string; kind: "folder"; label: string }
  | { key: string; kind: "secret"; label: string; required?: boolean };
