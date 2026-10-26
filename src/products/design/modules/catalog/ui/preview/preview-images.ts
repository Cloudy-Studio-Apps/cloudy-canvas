import { drawFrame } from "../../export/draw-frame";
import type { DesignEngine } from "../../../../design-engine.types";
import type { FrameElement } from "../../../frame";
import type { PreviewImageEntry as Entry } from "./preview-images.types";

/** How many page pictures the preview keeps (the spread shown and the ones around it). */
const CAPACITY = 12;
/** The workspace the preview draws in, so the user's page never changes. */
const WORKSPACE = "catalog:preview";

/**
 * The preview's page pictures at a given size, drawn once and kept for the most recent pages, so
 * turning back and forth (and the 3D view's turning sheet) shows them at once. One per engine.
 */
export class PreviewImages {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly engine: DesignEngine) {
    engine.onClose("catalog.previewImages", async () => this.clear());
  }

  /** The picture's URL if it's drawn already. */
  known(frame: FrameElement, maxSide: number): string | null {
    const entry = this.entries.get(keyOf(frame, maxSide));
    return entry?.frame === frame ? entry.url : null;
  }

  /** The picture's URL once it's drawn. */
  load(frame: FrameElement, maxSide: number): Promise<string> {
    const key = keyOf(frame, maxSide);
    const found = this.entries.get(key);
    if (found?.frame === frame) {
      // The most recently used go last, so the oldest are dropped first.
      this.entries.delete(key);
      this.entries.set(key, found);
      return found.picture;
    }
    if (found) this.drop(key, found);
    const entry: Entry = {
      frame,
      url: null,
      picture: drawFrame(this.engine.workspace(WORKSPACE), frame, { maxSide }).then((file) => {
        entry.url = URL.createObjectURL(file);
        return entry.url;
      }),
    };
    entry.picture.catch(() => this.entries.delete(key));
    this.entries.set(key, entry);
    for (const [oldKey, old] of this.entries) {
      if (this.entries.size <= CAPACITY) break;
      this.drop(oldKey, old);
    }
    return entry.picture;
  }

  private drop(key: string, entry: Entry): void {
    this.entries.delete(key);
    if (entry.url) URL.revokeObjectURL(entry.url);
  }

  private clear(): void {
    for (const [key, entry] of this.entries) this.drop(key, entry);
  }
}

function keyOf(frame: FrameElement, maxSide: number): string {
  return `${frame.id}@${maxSide}`;
}

const images = new WeakMap<DesignEngine, PreviewImages>();

/** The engine's preview pictures, made on first use. */
export function previewImagesOf(engine: DesignEngine): PreviewImages {
  let found = images.get(engine);
  if (!found) {
    found = new PreviewImages(engine);
    images.set(engine, found);
  }
  return found;
}
