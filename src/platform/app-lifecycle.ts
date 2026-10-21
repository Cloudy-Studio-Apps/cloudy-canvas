import type { AppLifecycle } from "@shared/core";
import { TauriAppLifecycle } from "./tauri-app-lifecycle";

/** The window closing. Does nothing outside the desktop app. */
export const appLifecycle: AppLifecycle = new TauriAppLifecycle();
