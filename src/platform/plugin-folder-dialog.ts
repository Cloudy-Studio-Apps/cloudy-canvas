import { pickFolder } from "./pick-folder";

/** Asks for a plugin's folder (the one holding `plugin.json`); `null` when cancelled. */
export function pickPluginFolder(title: string): Promise<string | null> {
  return pickFolder(title);
}
