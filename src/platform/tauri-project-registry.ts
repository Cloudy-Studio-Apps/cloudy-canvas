import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, rename } from "@tauri-apps/plugin-fs";

import { isProjectRecord, type ProjectRecord, type ProjectRegistry } from "@shared/core";
import { writeAtomic } from "./write-atomic";

/** The projects this device knows, kept in the app data folder. */
const REGISTRY_FILE = "projects.json";
/** Where an unreadable registry is moved, so nothing is lost for good. */
const CORRUPT_FILE = "projects.corrupt.json";

const encoder = new TextEncoder();

/** The registry of projects, stored as `<appData>/projects.json`. */
export class TauriProjectRegistry implements ProjectRegistry {
  /** Edits run one after another, so two edits never read the same old file. */
  private queue: Promise<unknown> = Promise.resolve();

  list(): Promise<ProjectRecord[]> {
    return this.queue.then(() => this.read());
  }

  async get(id: string): Promise<ProjectRecord | null> {
    return (await this.list()).find((record) => record.id === id) ?? null;
  }

  put(record: ProjectRecord): Promise<void> {
    return this.mutate((records) =>
      records.some((r) => r.id === record.id)
        ? records.map((r) => (r.id === record.id ? record : r))
        : [record, ...records],
    );
  }

  remove(id: string): Promise<void> {
    return this.mutate((records) => records.filter((r) => r.id !== id));
  }

  private mutate(edit: (records: ProjectRecord[]) => ProjectRecord[]): Promise<void> {
    const run = this.queue.then(async () => {
      if (!isTauri()) throw new Error("Projects are only available in the desktop app.");
      const records = edit(await this.read());
      await mkdir(await appDataDir(), { recursive: true });
      await writeAtomic(
        await registryPath(REGISTRY_FILE),
        encoder.encode(JSON.stringify(records, null, 2)),
      );
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async read(): Promise<ProjectRecord[]> {
    if (!isTauri()) return [];
    const path = await registryPath(REGISTRY_FILE);
    if (!(await exists(path))) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readTextFile(path));
    } catch (error) {
      console.error("[projects] The registry is unreadable; starting fresh.", error);
      await this.setAside(path);
      return [];
    }
    return Array.isArray(parsed) ? uniqueRecords(parsed.filter(isProjectRecord)) : [];
  }

  private async setAside(path: string): Promise<void> {
    try {
      await rename(path, await registryPath(CORRUPT_FILE));
    } catch (error) {
      console.error("[projects] Couldn't set the unreadable registry aside.", error);
    }
  }
}

/** Keeps the first entry for each id. */
function uniqueRecords(records: ProjectRecord[]): ProjectRecord[] {
  const ids = new Set<string>();
  return records.filter((record) => {
    if (ids.has(record.id)) return false;
    ids.add(record.id);
    return true;
  });
}

async function registryPath(name: string): Promise<string> {
  return join(await appDataDir(), name);
}
