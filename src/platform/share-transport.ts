import { isTauri } from "@tauri-apps/api/core";

import type { ShareTransport } from "@shared/core";
import { TauriShareTransport } from "./tauri-share-transport";

/** Live sessions' connections; `null` where the app can't make them (browser dev). */
export const shareTransport: ShareTransport | null = isTauri() ? new TauriShareTransport() : null;
