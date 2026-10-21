import type { StickerLibrary } from "@shared/core";
import { TauriStickerLibrary } from "./tauri-sticker-library";

/** The user's custom stickers for the current platform. */
export const stickerLibrary: StickerLibrary = new TauriStickerLibrary();
