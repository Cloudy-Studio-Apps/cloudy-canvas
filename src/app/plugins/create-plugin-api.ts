import * as board from "@board";
import * as boardUi from "@board/ui";
import * as canvas from "@canvas";
import * as canvasUi from "@canvas-ui";
import * as design from "@design";
import * as designUi from "@design/ui";
import { pluginStorage } from "@platform";
import * as sharedCore from "@shared/core";
import { PLUGIN_API_VERSION, type InstalledPlugin } from "@shared/core";
import { pluginLibs, pluginPlatform, pluginUi } from "./api";
import type { PluginApi } from "./plugin-api.types";
import type { PluginStaged } from "./plugin-api.types";
import { strictApi } from "./strict-api";

/**
 * The API handed to one plugin's `activate` (`staged`: its staged `api.stickers` and `api.themes`).
 * No names are listed here: each group is a barrel (or a curated group in `api/`), so whatever a
 * barrel exports is part of the API.
 */
export function createPluginApi(
  plugin: InstalledPlugin,
  { stickers, themes }: PluginStaged,
): PluginApi {
  const group = <T extends object>(name: string, value: T): T => strictApi(value, `api.${name}`);
  return strictApi<PluginApi>(
    {
      apiVersion: PLUGIN_API_VERSION,
      plugin: group("plugin", {
        id: plugin.manifest.id,
        manifest: plugin.manifest,
        readAsset: (path: string) => pluginStorage.readAsset(plugin, path),
        readText: async (path: string) =>
          new TextDecoder().decode(await pluginStorage.readAsset(plugin, path)),
      }),
      core: group("core", { ...sharedCore }),
      canvas: group("canvas", { ...canvas }),
      canvasUi: group("canvasUi", { ...canvasUi }),
      ui: group("ui", { ...pluginUi, kit: group("ui.kit", { ...pluginUi.kit }) }),
      platform: group("platform", { ...pluginPlatform }),
      libs: group("libs", { ...pluginLibs }),
      board: group("board", { ...board, ...boardUi }),
      design: group("design", { ...design, ...designUi }),
      stickers: group("stickers", stickers),
      themes: group("themes", themes),
    },
    "api",
  );
}
