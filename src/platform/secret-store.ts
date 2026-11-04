import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, rename, writeTextFile } from "@tauri-apps/plugin-fs";

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
      await save(all);
      cache = Promise.resolve(all);
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
  if (!isTauri()) return parse(localStorage.getItem(BROWSER_KEY)) ?? {};
  const path = await join(await appDataDir(), FILE);
  if (!(await exists(path))) return {};
  const parsed = parse(await readTextFile(path));
  if (parsed) return parsed;
  console.warn(`${FILE} is unreadable; keeping it as ${FILE}.bak and starting empty.`);
  await rename(path, `${path}.bak`);
  return {};
}

/** The string entries of a JSON object, or `null` when the text isn't one (empty text is `{}`). */
function parse(text: string | null): Record<string, string> | null {
  if (!text) return {};
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const all: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) if (typeof entry === "string") all[key] = entry;
  return all;
}

async function save(all: Record<string, string>): Promise<void> {
  const text = JSON.stringify(all);
  if (!isTauri()) {
    localStorage.setItem(BROWSER_KEY, text);
    return;
  }
  const dir = await appDataDir();
  await mkdir(dir, { recursive: true });
  await writeTextFile(await join(dir, FILE), text);
}
