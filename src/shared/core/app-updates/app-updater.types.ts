/**
 * How the app was installed: `installer` (Windows) and `appimage` replace themselves when they
 * update; a `package` (.deb, pacman) is updated by downloading the new package.
 */
export type InstallKind = "installer" | "appimage" | "package";

/** A newer version than the running one, found by `AppUpdater.check`. */
export interface AvailableUpdate {
  version: string;
  /** When it was released (ISO date), when known. */
  date: string | null;
  /** Its release notes (Markdown), when given. */
  notes: string | null;
  /** The release's page, where its files can be downloaded. */
  releaseUrl: string;
  /**
   * Downloads and installs it, reporting the share done (0–1, `null` while the size is unknown),
   * then restarts the app.
   */
  install(onProgress: (done: number | null) => void): Promise<void>;
}

/** Updates of the desktop app. Implemented per platform in `platform/`. */
export interface AppUpdater {
  installKind(): Promise<InstallKind>;
  /** The newest version when it's newer than the running one, else `null`. */
  check(): Promise<AvailableUpdate | null>;
}
