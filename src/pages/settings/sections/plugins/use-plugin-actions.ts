import { pickPluginFolder, pluginStorage, revealFile } from "@platform";
import type { BrokenPlugin, InstalledPlugin } from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { PluginActions } from "./plugins.types";
import { t } from "../../settings.i18n";

/** Installing, linking and removing plugins; each change applies after a reload. */
export function usePluginActions(): PluginActions {
  const rescan = async () => {
    const scan = await pluginStorage.list();
    const { statuses, setLoaded, markNeedsReload } = usePluginsStore.getState();
    setLoaded({ installed: scan.plugins, broken: scan.broken, statuses });
    markNeedsReload();
  };

  const add = (how: "install" | "link") =>
    void (async () => {
      const path = await pickPluginFolder(
        how === "install" ? t("plugins.pickInstall") : t("plugins.pickLink"),
      );
      if (!path) return;
      const plugin =
        how === "install"
          ? await pluginStorage.installFromFolder(path)
          : await pluginStorage.link(path);
      await rescan();
      toast({
        title: t(how === "install" ? "plugins.installed" : "plugins.added", {
          name: plugin.manifest.name,
        }),
        description: t("plugins.turnOnBelow"),
      });
    })().catch((error: unknown) => notifyError(t("errors.pluginAdd"), error));

  return {
    install: () => add("install"),
    link: () => add("link"),
    remove: (plugin: InstalledPlugin) =>
      void (async () => {
        await pluginStorage.remove(plugin);
        usePluginsStore.getState().setEnabled(plugin.manifest.id, false);
        await rescan();
      })().catch((error: unknown) => notifyError(t("errors.pluginRemove"), error)),
    removeBroken: (plugin: BrokenPlugin) =>
      void pluginStorage
        .remove(plugin)
        .then(rescan)
        .catch((error: unknown) => notifyError(t("errors.pluginRemove"), error)),
    reveal: (path: string) =>
      void revealFile(path).catch((error: unknown) => notifyError(t("errors.folderFailed"), error)),
    showFolder: () =>
      void pluginStorage
        .folder()
        .then((folder) => (folder ? revealFile(folder) : undefined))
        .catch((error: unknown) => notifyError(t("errors.folderFailed"), error)),
  };
}
