import type { DataFormat } from "../../data.points.types";
import type { SettingValue } from "../../source";

export interface FormatSelectProps {
  formats: readonly DataFormat[];
  /** `"auto"` or a format id. */
  format: string;
  options: Record<string, SettingValue>;
  /** A format and its options; another format starts with no options. */
  onChange: (format: string, options: Record<string, SettingValue>) => void;
}
