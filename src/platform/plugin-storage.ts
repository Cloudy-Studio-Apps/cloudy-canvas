import type { PluginStorage } from "@shared/core";
import { TauriPluginStorage } from "./tauri-plugin-storage";

/** The user's plugins for the current platform. */
export const pluginStorage: PluginStorage = new TauriPluginStorage();
