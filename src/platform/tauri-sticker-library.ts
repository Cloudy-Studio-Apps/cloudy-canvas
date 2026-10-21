import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readFile,
  readTextFile,
  remove,
  rename,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import { createId, type CustomSticker, type StickerImage, type StickerLibrary } from "@shared/core";
import type { LibraryEdit } from "./tauri-sticker-library.types";

/** The library's folder in the app data folder: one file per sticker plus an index. */
const FOLDER = "stickers";
const INDEX_FILE = "index.json";

/** Custom stickers on disk. Outside Tauri they're kept in memory for the session. */
export class TauriStickerLibrary implements StickerLibrary {
  /** Index edits run one after another, so two edits never read the same old index. */
  private queue: Promise<unknown> = Promise.resolve();
  private readonly memory = new Map<string, { sticker: CustomSticker; data: Uint8Array }>();

  async list(): Promise<CustomSticker[]> {
    if (!isTauri()) return [...this.memory.values()].map((entry) => entry.sticker);
    return this.readIndex();
  }

  async read(id: string): Promise<Uint8Array> {
    if (!isTauri()) {
      const entry = this.memory.get(id);
      if (!entry) throw new Error("This sticker isn't in the library anymore.");
      return entry.data;
    }
    return readFile(await stickerPath(id));
  }

  async add(image: StickerImage): Promise<CustomSticker> {
    const sticker: CustomSticker = {
      id: createId(),
      name: image.name,
      type: image.type,
      addedAt: new Date().toISOString(),
    };
    if (!isTauri()) {
      this.memory.set(sticker.id, { sticker, data: image.data });
      return sticker;
    }
    await mkdir(await folderPath(), { recursive: true });
    await writeFile(await stickerPath(sticker.id), image.data);
    return this.mutate((stickers) => ({ stickers: [...stickers, sticker], result: sticker }));
  }

  async remove(id: string): Promise<void> {
    if (!isTauri()) {
      this.memory.delete(id);
      return;
    }
    await this.mutate((stickers) => ({
      stickers: stickers.filter((sticker) => sticker.id !== id),
      result: undefined,
    }));
    const path = await stickerPath(id);
    if (await exists(path)) await remove(path);
  }

  /** Reads the index, applies `edit` and writes the result, after any edit already running. */
  private mutate<T>(edit: (stickers: CustomSticker[]) => LibraryEdit<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const { stickers, result } = edit(await this.readIndex());
      await this.writeIndex(stickers);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async readIndex(): Promise<CustomSticker[]> {
    const path = await indexPath();
    if (!(await exists(path))) return [];
    try {
      const parsed: unknown = JSON.parse(await readTextFile(path));
      return Array.isArray(parsed) ? parsed.filter(isCustomSticker) : [];
    } catch (error) {
      console.error("[stickers] The sticker library index is unreadable.", error);
      return [];
    }
  }

  private async writeIndex(stickers: CustomSticker[]): Promise<void> {
    const path = await indexPath();
    // Written beside the index and swapped in, so a failed write never leaves half a file.
    await writeTextFile(`${path}.tmp`, JSON.stringify(stickers, null, 2));
    await rename(`${path}.tmp`, path);
  }
}

function isCustomSticker(value: unknown): value is CustomSticker {
  if (typeof value !== "object" || value === null) return false;
  const { id, name, type, addedAt } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof name === "string" &&
    typeof type === "string" &&
    typeof addedAt === "string"
  );
}

async function folderPath(): Promise<string> {
  return join(await appDataDir(), FOLDER);
}

async function indexPath(): Promise<string> {
  return join(await folderPath(), INDEX_FILE);
}

/** Sticker files are named by id; their type is in the index. */
async function stickerPath(id: string): Promise<string> {
  return join(await folderPath(), id);
}
