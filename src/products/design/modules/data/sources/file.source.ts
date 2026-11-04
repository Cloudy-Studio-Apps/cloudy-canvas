import { t } from "../data.i18n";
import type { DataSourceType } from "../data.points.types";
import { CSV_FORMAT, JSON_FORMAT } from "../formats";
import { baseName, withoutExtension } from "../settings";
import { UPDATE_ERRORS } from "../update";

/**
 * A file on the device. Its `path` setting keeps only the file's name in the document; the path
 * itself stays on this device (`ctx.files.path`), so another device picks the file again.
 */
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
    return path ? withoutExtension(baseName(path)) : t("sources.file.label");
  },
  async update(settings, ctx) {
    const name = typeof settings.path === "string" ? settings.path : "";
    if (!name) throw new Error("No file chosen.");
    const path = ctx.files.path;
    if (!path) throw new Error(UPDATE_ERRORS.pickFileAgain);
    const bytes = await ctx.services.readFile(path);
    return { bytes, fileName: baseName(path) };
  },
};
