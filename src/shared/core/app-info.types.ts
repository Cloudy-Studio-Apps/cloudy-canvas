export interface AppInfo {
  /** The app's version, e.g. "0.1.0". */
  version: string;
  /** The Tauri runtime's version; `null` outside the desktop app. */
  tauriVersion: string | null;
  build: "development" | "production";
}
