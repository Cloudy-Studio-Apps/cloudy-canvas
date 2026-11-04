import type { SettingValue } from "../source";

/** What a new source is made from; `settings` may hold secret values, which stay on the device. */
export interface DataSourceInit {
  sourceType: string;
  settings: Record<string, SettingValue>;
  secrets?: Record<string, string>;
  format?: string;
  formatOptions?: Record<string, SettingValue>;
  name?: string;
}
