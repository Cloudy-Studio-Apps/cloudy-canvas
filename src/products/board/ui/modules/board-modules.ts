import { composeProduct, type CanvasProduct } from "@canvas";
import type { EditorModules } from "@canvas-ui";
import { boardCanvas, type BoardToolOptions } from "@board";
import {
  createModuleHost,
  pluginViewerSources,
  stickerCatalog,
  type AppModule,
  type ModuleHost,
} from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { colorsModule } from "@board/modules/colors/colors.module";
import { connectorModule } from "@board/modules/connector/connector.module";
import { coreModule } from "@board/modules/core/core.module";
import { dbModule } from "@board/modules/db/db.module";
import { drawModule } from "@board/modules/draw/draw.module";
import { embedModule } from "@board/modules/embed/embed.module";
import { erModule } from "@board/modules/er/er.module";
import { geoModule } from "@board/modules/geo/geo.module";
import { imageModule } from "@board/modules/image/image.module";
import { libraryModule } from "@board/modules/library/library.module";
import { sectionModule } from "@board/modules/section/section.module";
import { stickerModule } from "@board/modules/sticker/sticker.module";
import { stickyModule } from "@board/modules/sticky/sticky.module";
import { tableModule } from "@board/modules/table/table.module";
import { textModule } from "@board/modules/text/text.module";
import { viewerModule } from "@board/modules/viewer/viewer.module";
import { boardEditor } from "./board-editor-points";
import type { BoardModuleOptions } from "./board-modules.types";

/** The board's built-in modules. Their order is the default order of chained hooks. */
let modules: AppModule[] = [
  coreModule,
  colorsModule,
  drawModule,
  stickyModule,
  stickerModule,
  textModule,
  geoModule,
  connectorModule,
  sectionModule,
  tableModule,
  imageModule,
  embedModule,
  dbModule,
  erModule,
  libraryModule,
  viewerModule,
];
/** Module id → the plugin it comes from (installed plugins, which may fail on their own). */
const pluginOf = new Map<string, string>();

let host: ModuleHost | null = null;
let product: CanvasProduct<BoardToolOptions> | null = null;
let editor: EditorModules | null = null;

/**
 * Adds a module to every board. Call it at startup, before a board opens: the modules are loaded
 * once, the first time they're needed. A plugin's modules pass `plugin`: if one fails, the plugin
 * is marked as failed and left out instead of stopping the board.
 */
export function registerBoardModule(module: AppModule, options: BoardModuleOptions = {}): void {
  if (host) {
    throw new Error(`The module "${module.id}" was registered after the board's modules loaded.`);
  }
  modules.push(module);
  if (options.plugin) pluginOf.set(module.id, options.plugin);
}

/** The board's loaded modules (composing the product first, which may leave plugins out). */
export function getBoardModules(): ModuleHost {
  getBoardProduct();
  return loadModules();
}

function loadModules(): ModuleHost {
  host ??= createModuleHost(modules, {
    isOptional: (module) => pluginOf.has(module.id),
    onError: (module, error) =>
      failPlugin(pluginOf.get(module.id), `${module.id}: ${error.message}`),
  });
  return host;
}

/**
 * The board product, composed from its modules' canvas points. If the plugins' contributions
 * clash in a way only composing finds (a command bound twice, an option given twice), the board
 * is composed again without any plugin.
 */
export function getBoardProduct(): CanvasProduct<BoardToolOptions> {
  if (product) return product;
  try {
    product = composeProduct("board", loadModules(), boardCanvas);
  } catch (error) {
    const plugins = new Set(pluginOf.values());
    if (plugins.size === 0) throw error;
    const message = error instanceof Error ? error.message : String(error);
    for (const plugin of plugins)
      failPlugin(plugin, `The board couldn't use its plugins: ${message}`);
    modules = modules.filter((module) => !pluginOf.has(module.id));
    pluginOf.clear();
    host = null;
    product = composeProduct("board", loadModules(), boardCanvas);
  }
  return product;
}

/** What the board editor provides to its chrome through `EditorModulesContext`. */
export function getBoardEditorModules(): EditorModules {
  editor ??= { host: getBoardModules(), points: boardEditor };
  return editor;
}

function failPlugin(plugin: string | undefined, error: string): void {
  if (!plugin) return;
  stickerCatalog.drop(plugin);
  pluginViewerSources.drop(plugin);
  usePluginsStore.getState().setStatus({ id: plugin, state: "failed", error, modules: [] });
}
