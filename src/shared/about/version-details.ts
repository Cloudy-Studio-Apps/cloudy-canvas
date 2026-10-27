import { clipboard } from "@platform";
import type { AppInfo } from "@shared/core";
import { notifyError, toast } from "@shared/stores/toast-store";
import { t } from "./about.i18n";

const BUILD_LABEL: Record<AppInfo["build"], string> = {
  development: t("build.development"),
  production: t("build.production"),
};

/** "Version 0.1.0", "Tauri 2.x" and the build, or nothing until the info is read. */
export function versionDetails(info: AppInfo | null): string[] {
  if (!info) return [];
  const details = [t("version", { version: info.version }), BUILD_LABEL[info.build]];
  if (info.tauriVersion) details.splice(1, 0, `Tauri ${info.tauriVersion}`);
  return details;
}

/** Copies the app's name and version details, for bug reports. */
export function copyVersionDetails(details: readonly string[]): void {
  void clipboard.writeText(`Cloudy Canvas · ${details.join(" · ")}`).then(
    () => toast({ title: t("copied") }),
    (error: unknown) => notifyError(t("copyFailed"), error),
  );
}
