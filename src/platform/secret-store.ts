import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

import type { SecretStore } from "@shared/core";

const FILE = "secrets.json";
const BROWSER_KEY = "cloudy.secrets";

/** Read once, then kept here; every write saves the whole object. */
let cache: Promise<Record<string, string>> | null = null;
/** Writes run one after another, so two never save over each other. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Secrets on this device: `secrets.json` in the app data folder on the desktop, `localStorage` in
 * a browser.
 */
export const secretStore: SecretStore = {
  async get(key) {
    const all = await load();
    return Object.hasOwn(all, key) ? (all[key] ?? null) : null;
  },
  set(key, value) {
    const run = queue.then(async () => {
      const all = { ...(await load()) };
      if (value === null) delete all[key];
      else all[key] = value;
      cache = Promise.resolve(all);
      await save(all);
    });
    queue = run.catch(() => undefined);
    return run;
  },
};

function load(): Promise<Record<string, string>> {
  cache ??= read().catch((error: unknown) => {
    cache = null;
    throw error;
  });
  return cache;
}

async function read(): Promise<Record<string, string>> {
  let text: string | null;
  if (isTauri()) {
    const path = await join(await appDataDir(), FILE);
    text = (await exists(path)) ? await readTextFile(path) : null;
  } else {
    text = localStorage.getItem(BROWSER_KEY);
  }
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

async function save(all: Record<string, string>): Promise<void> {
  const text = JSON.stringify(all);
  if (!isTauri()) {
    localStorage.setItem(BROWSER_KEY, text);
    return;
  }
  await writeTextFile(await join(await appDataDir(), FILE), text);
}
