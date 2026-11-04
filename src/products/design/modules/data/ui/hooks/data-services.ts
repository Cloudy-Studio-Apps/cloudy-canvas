import { http, isAppDataPath, openFile, pickFolder, readLocalFile, secretStore } from "@platform";
import type { DataServices } from "../../services";
import { UPDATE_ERRORS } from "../../update";
import { t } from "../../data.i18n";

/**
 * What data sources reach on this device: the web, its files and its secrets. Files inside the
 * app's own data folder (where `secrets.json` is) are never read, whoever asks.
 */
export const platformDataServices: DataServices = {
  http,
  async readFile(path) {
    if (await isAppDataPath(path)) throw new Error(UPDATE_ERRORS.privateFile);
    return readLocalFile(path);
  },
  async pickFile(extensions) {
    const file = await openFile({
      title: t("source.pickFile"),
      filters: [{ name: t("source.dataFiles"), extensions }],
    });
    return file ? { path: file.path, name: file.name, bytes: file.bytes } : null;
  },
  pickFolder: () => pickFolder(t("source.pickFolder")),
  secrets: secretStore,
  isPrivatePath: isAppDataPath,
};
