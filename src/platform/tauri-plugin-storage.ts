import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readDir,
  readFile,
  readTextFile,
  remove,
  rename,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import {
  isSafeRelativePath,
  readPluginManifest,
  type BrokenPlugin,
  type InstalledPlugin,
  type PluginManifest,
  type PluginScan,
  type PluginStorage,
} from "@shared/core";
import { copyFolder } from "./copy-folder";
import type { PluginIndex } from "./tauri-plugin-storage.types";

/** Copied plugins are folders in here, named by id; `index.json` lists the linked ones. */
const FOLDER = "plugins";
const INDEX_FILE = "index.json";
const MANIFEST_FILE = "plugin.json";

/** Plugins on disk. Outside Tauri there are none. */
export class TauriPluginStorage implements PluginStorage {
  /** Index edits run one after another, so two edits never read the same old index. */
  private queue: Promise<unknown> = Promise.resolve();

  async list(): Promise<PluginScan> {
    if (!isTauri()) return { plugins: [], broken: [] };
    const plugins: InstalledPlugin[] = [];
    const broken: BrokenPlugin[] = [];
    const add = async (path: string, source: InstalledPlugin["source"]) => {
      try {
        const manifest = await readManifest(path);
        const taken = plugins.find((plugin) => plugin.manifest.id === manifest.id);
        if (taken) throw new Error(`Another plugin (${taken.path}) has the id "${manifest.id}".`);
        plugins.push({ manifest, source, path });
      } catch (error) {
        broken.push({ path, error: error instanceof Error ? error.message : String(error) });
      }
    };

    const folder = await folderPath();
    if (await exists(folder)) {
      for (const entry of await readDir(folder)) {
        if (entry.isDirectory) await add(await join(folder, entry.name), "copied");
      }
    }
    for (const path of (await this.readIndex()).linked) await add(path, "linked");
    return { plugins, broken };
  }

  async readMain(plugin: InstalledPlugin): Promise<string> {
    return readTextFile(await join(plugin.path, plugin.manifest.main));
  }

  async readAsset(plugin: InstalledPlugin, path: string): Promise<Uint8Array> {
    if (!isSafeRelativePath(path)) throw new Error(`"${path}" isn't a file inside the plugin.`);
    return readFile(await join(plugin.path, path));
  }

  async installFromFolder(path: string): Promise<InstalledPlugin> {
    const manifest = await readManifest(path);
    const target = await join(await folderPath(), manifest.id);
    // Copied beside the old version and swapped in, so a failed copy keeps the old one.
    const staging = `${target}.installing`;
    if (await exists(staging)) await remove(staging, { recursive: true });
    await copyFolder(path, staging);
    if (await exists(target)) await remove(target, { recursive: true });
    await rename(staging, target);
    return { manifest, source: "copied", path: target };
  }

  async link(path: string): Promise<InstalledPlugin> {
    const manifest = await readManifest(path);
    await this.mutate((index) => ({
      linked: index.linked.includes(path) ? index.linked : [...index.linked, path],
    }));
    return { manifest, source: "linked", path };
  }

  async remove(plugin: InstalledPlugin): Promise<void> {
    if (plugin.source === "linked") {
      await this.mutate((index) => ({ linked: index.linked.filter((p) => p !== plugin.path) }));
    } else if (await exists(plugin.path)) {
      await remove(plugin.path, { recursive: true });
    }
  }

  async folder(): Promise<string | null> {
    if (!isTauri()) return null;
    const folder = await folderPath();
    await mkdir(folder, { recursive: true });
    return folder;
  }

  /** Reads the index, applies `edit` and writes the result, after any edit already running. */
  private mutate(edit: (index: PluginIndex) => PluginIndex): Promise<void> {
    const run = this.queue.then(async () => {
      const next = edit(await this.readIndex());
      const path = await indexPath();
      await mkdir(await folderPath(), { recursive: true });
      // Written beside the index and swapped in, so a failed write never leaves half a file.
      await writeTextFile(`${path}.tmp`, JSON.stringify(next, null, 2));
      await rename(`${path}.tmp`, path);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async readIndex(): Promise<PluginIndex> {
    const path = await indexPath();
    if (!(await exists(path))) return { linked: [] };
    try {
      const parsed: unknown = JSON.parse(await readTextFile(path));
      const linked = (parsed as Partial<PluginIndex> | null)?.linked;
      return {
        linked: Array.isArray(linked) ? linked.filter((p) => typeof p === "string") : [],
      };
    } catch (error) {
      console.error("[plugins] The plugin index is unreadable.", error);
      return { linked: [] };
    }
  }
}

async function readManifest(folder: string): Promise<PluginManifest> {
  const path = await join(folder, MANIFEST_FILE);
  if (!(await exists(path))) throw new Error(`There's no ${MANIFEST_FILE} in ${folder}.`);
  let data: unknown;
  try {
    data = JSON.parse(await readTextFile(path));
  } catch {
    throw new Error(`${MANIFEST_FILE} isn't valid JSON.`);
  }
  const manifest = readPluginManifest(data);
  if (typeof manifest === "string") throw new Error(manifest);
  return manifest;
}

async function folderPath(): Promise<string> {
  return join(await appDataDir(), FOLDER);
}

async function indexPath(): Promise<string> {
  return join(await folderPath(), INDEX_FILE);
}
