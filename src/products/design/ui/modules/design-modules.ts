import { composeProduct, type CanvasProduct } from "@canvas";
import type { EditorModules } from "@canvas-ui";
import { designCanvas, type DesignToolOptions } from "@design";
import { createModuleHost, type AppModule, type ModuleHost } from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { assetsModule } from "@design/modules/assets/assets.module";
import { coreModule } from "@design/modules/core/core.module";
import { ellipseModule } from "@design/modules/ellipse/ellipse.module";
import { frameModule } from "@design/modules/frame/frame.module";
import { groupModule } from "@design/modules/group/group.module";
import { imageModule } from "@design/modules/image/image.module";
import { layersModule } from "@design/modules/layers/layers.module";
import { lineModule } from "@design/modules/line/line.module";
import { pluginsTabModule } from "@design/modules/plugins-tab/plugins-tab.module";
import { polygonModule } from "@design/modules/polygon/polygon.module";
import { rectangleModule } from "@design/modules/rectangle/rectangle.module";
import { sectionModule } from "@design/modules/section/section.module";
import { starModule } from "@design/modules/star/star.module";
import { textModule } from "@design/modules/text/text.module";
import { vectorModule } from "@design/modules/vector/vector.module";
import { designEditor } from "./design-editor-points";
import type { DesignModuleOptions } from "./design-modules.types";

/** The design's built-in modules. Their order is the default order of chained hooks. */
let modules: AppModule[] = [
  coreModule,
  frameModule,
  sectionModule,
  groupModule,
  rectangleModule,
  lineModule,
  ellipseModule,
  polygonModule,
  starModule,
  textModule,
  vectorModule,
  imageModule,
  layersModule,
  assetsModule,
  pluginsTabModule,
];
/** Module id → the plugin it comes from (installed plugins, which may fail on their own). */
const pluginOf = new Map<string, string>();

let host: ModuleHost | null = null;
let product: CanvasProduct<DesignToolOptions> | null = null;
let editor: EditorModules | null = null;

/**
 * Adds a module to every design. Call it at startup, before a design opens: the modules are
 * loaded once, the first time they're needed. A plugin's modules pass `plugin`: if one fails, the
 * plugin is marked as failed and left out instead of stopping the design.
 */
export function registerDesignModule(module: AppModule, options: DesignModuleOptions = {}): void {
  if (host) {
    throw new Error(`The module "${module.id}" was registered after the design's modules loaded.`);
  }
  modules.push(module);
  if (options.plugin) pluginOf.set(module.id, options.plugin);
}

/** The design's loaded modules (composing the product first, which may leave plugins out). */
export function getDesignModules(): ModuleHost {
  getDesignProduct();
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
 * The design product, composed from its modules' canvas points. If the plugins' contributions
 * clash in a way only composing finds (a command bound twice, an option given twice), the design
 * is composed again without any plugin.
 */
export function getDesignProduct(): CanvasProduct<DesignToolOptions> {
  if (product) return product;
  try {
    product = composeProduct("design", loadModules(), designCanvas);
  } catch (error) {
    const plugins = new Set(pluginOf.values());
    if (plugins.size === 0) throw error;
    const message = error instanceof Error ? error.message : String(error);
    for (const plugin of plugins)
      failPlugin(plugin, `The design couldn't use its plugins: ${message}`);
    modules = modules.filter((module) => !pluginOf.has(module.id));
    pluginOf.clear();
    host = null;
    product = composeProduct("design", loadModules(), designCanvas);
  }
  return product;
}

/** What the design editor provides to its chrome through `EditorModulesContext`. */
export function getDesignEditorModules(): EditorModules {
  editor ??= { host: getDesignModules(), points: designEditor };
  return editor;
}

function failPlugin(plugin: string | undefined, error: string): void {
  if (!plugin) return;
  usePluginsStore.getState().setStatus({ id: plugin, state: "failed", error, modules: [] });
}
