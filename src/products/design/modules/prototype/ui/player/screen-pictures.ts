import type { FrameElement } from "../../../frame";
import type { DesignEngine } from "../../../../design-engine.types";
import { playerWorkspace } from "./player-workspace";
import type { ScreenPictureEntry as Entry } from "./screen-pictures.types";

/**
 * The player's screen pictures, drawn in the `prototype:player` workspace and kept per screen for
 * the session: a picture stays while its entry's `screen` is the screen read now (an edit makes
 * a new object, drawn again) and it was drawn at least as sharp as asked. A replaced picture's URL
 * is revoked once the new one is drawn, so what's on screen never goes blank; `clear` revokes all.
 */
export class ScreenPictures {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly engine: DesignEngine) {}

  /** The picture's URL if it's drawn already, else `null`. */
  known(screen: FrameElement, scale: number): string | null {
    const entry = this.entries.get(screen.id);
    return entry && fits(entry, screen, scale) ? entry.url : null;
  }

  /** The picture's object URL once it's drawn. */
  load(screen: FrameElement, scale: number): Promise<string> {
    const found = this.entries.get(screen.id);
    if (found && fits(found, screen, scale)) return found.picture;
    const entry: Entry = { screen, scale, url: null, dropped: false, picture: Promise.resolve("") };
    entry.picture = this.draw(screen, scale).then(
      (blob) => {
        entry.url = URL.createObjectURL(blob);
        if (entry.dropped) URL.revokeObjectURL(entry.url);
        if (found) this.drop(found);
        return entry.url;
      },
      (error: unknown) => {
        if (this.entries.get(screen.id) === entry) {
          if (found) this.entries.set(screen.id, found);
          else this.entries.delete(screen.id);
        }
        throw error;
      },
    );
    this.entries.set(screen.id, entry);
    return entry.picture;
  }

  /** Revokes every picture (the player closed). */
  clear(): void {
    for (const entry of this.entries.values()) this.drop(entry);
    this.entries.clear();
  }

  private draw(screen: FrameElement, scale: number): Promise<Blob> {
    return playerWorkspace(this.engine, screen.pageId).exportElements({
      format: "png",
      background: "solid",
      area: "board",
      ids: [screen.id],
      rect: screen,
      scale,
    });
  }

  private drop(entry: Entry): void {
    entry.dropped = true;
    if (entry.url) URL.revokeObjectURL(entry.url);
  }
}

function fits(entry: Entry, screen: FrameElement, scale: number): boolean {
  return entry.screen === screen && entry.scale >= scale && !entry.dropped;
}
