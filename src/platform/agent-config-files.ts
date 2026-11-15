import { isTauri } from "@tauri-apps/api/core";
import { configDir, homeDir, join } from "@tauri-apps/api/path";
import { exists, readTextFile } from "@tauri-apps/plugin-fs";

import { isAndroidPlatform } from "@shared/core";
import type { AgentConfigBase } from "./agent-config-files.types";
import { writeAtomic } from "./write-atomic";

/**
 * Agent apps' own config files (Claude Code, Claude Desktop), which the app adds its server to.
 * Their paths are allowed one by one in the capabilities. Desktop app only.
 */
export const agentConfigFiles = {
  /**
   * The file at `parts` inside the home or the OS's config folder, when its first part exists (the
   * app is installed); `null` otherwise, and everywhere but the desktop app.
   */
  async find(base: AgentConfigBase, parts: readonly string[]): Promise<string | null> {
    const [first] = parts;
    if (!isTauri() || isAndroidPlatform() || first === undefined) return null;
    const root = base === "home" ? await homeDir() : await configDir();
    if (!(await exists(await join(root, first)))) return null;
    return join(root, ...parts);
  },
  /** The file's text, or `null` when it doesn't exist yet. */
  async read(path: string): Promise<string | null> {
    return (await exists(path)) ? readTextFile(path) : null;
  },
  write(path: string, text: string): Promise<void> {
    return writeAtomic(path, new TextEncoder().encode(text));
  },
};
