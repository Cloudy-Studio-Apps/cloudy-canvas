import type { Storage } from "@shared/core";
import { TauriStorage } from "./tauri-storage";

/** The app's storage for the current platform. */
export const storage: Storage = new TauriStorage();
