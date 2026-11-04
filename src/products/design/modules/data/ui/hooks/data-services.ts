import { http, openFile, readLocalFile, secretStore } from "@platform";
import type { DataServices } from "../../services";
import { t } from "../../data.i18n";

/** What data sources reach on this device: the web, its files and its secrets. */
export const platformDataServices: DataServices = {
  http,
  readFile: readLocalFile,
  async pickFile(extensions) {
    const file = await openFile({
      title: t("source.pickFile"),
      filters: [{ name: t("source.dataFiles"), extensions }],
    });
    return file ? { path: file.path, name: file.name, bytes: file.bytes } : null;
  },
  secrets: secretStore,
};
