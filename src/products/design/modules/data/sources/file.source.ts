import { t } from "../data.i18n";
import type { DataSourceType } from "../data.points.types";
import { CSV_FORMAT, JSON_FORMAT } from "../formats";

/** Last path segment, either slash. */
function baseName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

/** A file on the device. */
export const FILE_SOURCE: DataSourceType = {
  id: "file",
  get label() {
    return t("sources.file.label");
  },
  icon: "File",
  get settings() {
    return [
      {
        key: "path",
        kind: "file" as const,
        label: t("sources.file.path"),
        extensions: [...CSV_FORMAT.extensions, ...JSON_FORMAT.extensions],
      },
    ];
  },
  defaultName(settings) {
    const path = typeof settings.path === "string" ? settings.path : "";
    return path ? baseName(path) : t("sources.file.label");
  },
  async update(settings, ctx) {
    const path = typeof settings.path === "string" ? settings.path : "";
    if (!path) throw new Error("No file chosen.");
    const bytes = await ctx.services.readFile(path);
    return { bytes, fileName: baseName(path) };
  },
};
