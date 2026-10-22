import { pickPluginFolder, pluginStorage, revealFile } from "@platform";
import type { InstalledPlugin } from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { PluginActions } from "./plugins.types";

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
        how === "install" ? "Install a plugin from its folder" : "Load a plugin you're developing",
      );
      if (!path) return;
      const plugin =
        how === "install"
          ? await pluginStorage.installFromFolder(path)
          : await pluginStorage.link(path);
      await rescan();
      toast({
        title: `${plugin.manifest.name} ${how === "install" ? "installed" : "added"}`,
        description: "Turn it on below, then reload to use it.",
      });
    })().catch((error: unknown) => notifyError("The plugin couldn't be added", error));

  return {
    install: () => add("install"),
    link: () => add("link"),
    remove: (plugin: InstalledPlugin) =>
      void (async () => {
        await pluginStorage.remove(plugin);
        usePluginsStore.getState().setEnabled(plugin.manifest.id, false);
        await rescan();
      })().catch((error: unknown) => notifyError("The plugin couldn't be removed", error)),
    reveal: (path: string) =>
      void revealFile(path).catch((error: unknown) =>
        notifyError("The folder couldn't be opened", error),
      ),
    showFolder: () =>
      void pluginStorage
        .folder()
        .then((folder) => (folder ? revealFile(folder) : undefined))
        .catch((error: unknown) => notifyError("The folder couldn't be opened", error)),
  };
}
