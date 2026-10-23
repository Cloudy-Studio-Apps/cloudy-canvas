import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";

import { releasePageUrl } from "@shared/core";
import type { AppUpdater, AvailableUpdate, InstallKind } from "@shared/core";

/**
 * Tauri's updater, reading `latest.json` from the latest GitHub release (`plugins.updater` in
 * `tauri.conf.json`). Downloads are checked against the updater's public key.
 */
export class TauriAppUpdater implements AppUpdater {
  private kind: Promise<InstallKind> | null = null;

  installKind(): Promise<InstallKind> {
    this.kind ??= invoke<InstallKind>("install_kind");
    return this.kind;
  }

  async check(): Promise<AvailableUpdate | null> {
    const update = await check();
    return update ? this.available(update) : null;
  }

  private available(update: Update): AvailableUpdate {
    return {
      version: update.version,
      date: update.date ?? null,
      notes: update.body?.trim() || null,
      releaseUrl: releasePageUrl(update.version),
      install: async (onProgress) => {
        let total: number | null = null;
        let received = 0;
        await update.downloadAndInstall((event) => {
          if (event.event === "Started") total = event.data.contentLength ?? null;
          if (event.event === "Progress") received += event.data.chunkLength;
          if (event.event === "Finished") received = total ?? received;
          onProgress(total ? Math.min(received / total, 1) : null);
        });
        // The Windows installer closes and reopens the app itself; an AppImage needs a restart.
        await relaunch();
      },
    };
  }
}
