import type { SettingSpec } from "./setting-spec.types";

/** A setting that names a place on this device (a file or a folder): its path stays on the device. */
export function holdsDevicePath(
  spec: SettingSpec,
): spec is Extract<SettingSpec, { kind: "file" | "folder" }> {
  return spec.kind === "file" || spec.kind === "folder";
}
