import type { RawData, SourceContext } from "./services";
import type { SettingSpec } from "./settings";
import type { SettingValue } from "./source";

/** Where data comes from (a file, a link, a sheet). Built-ins and plugins register these. */
export interface DataSourceType {
  id: string;
  label: string;
  /** A lucide icon name; the UI maps it (engine code cannot import the UI's icon type). */
  icon: string;
  settings: SettingSpec[];
  defaultName(settings: Record<string, SettingValue>): string;
  /**
   * Where the source's secrets may be sent (a link's origin), or `null` when nowhere. Secrets
   * entered for one origin are bound to it: once the settings point at another they aren't sent
   * and read as missing until given again. Left out, secrets aren't bound.
   */
  secretOrigin?(settings: Record<string, SettingValue>): string | null;
  update(settings: Record<string, SettingValue>, ctx: SourceContext): Promise<RawData>;
}

/** How raw data becomes rows. */
export interface DataFormat {
  id: string;
  label: string;
  extensions: string[];
  mimes: string[];
  options?: SettingSpec[];
  sniff?(raw: RawData): boolean;
  parse(raw: RawData, options: Record<string, SettingValue>): Promise<unknown>;
}
