import type { AppLinks } from "@shared/core";
import { TauriAppLinks } from "./tauri-app-links";

/** `cloudy-canvas://` links the OS asks the app to open. Does nothing outside the desktop app. */
export const appLinks: AppLinks = new TauriAppLinks();
