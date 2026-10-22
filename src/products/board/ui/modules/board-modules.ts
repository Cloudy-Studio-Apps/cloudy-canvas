import { composeProduct, type CanvasProduct } from "@canvas";
import type { EditorModules } from "@canvas-ui";
import { boardCanvas, type BoardToolOptions } from "@board";
import { createModuleHost, type AppModule, type ModuleHost } from "@shared/core";
import { dbModule } from "@board/modules/db/db.module";
import { embedModule } from "@board/modules/embed/embed.module";
import { legacyModule } from "@board/modules/legacy/legacy.module";
import { stickyModule } from "@board/modules/sticky/sticky.module";
import { boardEditor } from "./board-editor-points";

/** The board's built-in modules. Their order is the default order of chained hooks. */
const modules: AppModule[] = [stickyModule, embedModule, dbModule, legacyModule];

let host: ModuleHost | null = null;
let product: CanvasProduct<BoardToolOptions> | null = null;
let editor: EditorModules | null = null;

/**
 * Adds a module (a plugin) to every board. Call it at startup, before a board opens: the modules
 * are loaded once, the first time they're needed.
 */
export function registerBoardModule(module: AppModule): void {
  if (host)
    throw new Error(`The module "${module.id}" was registered after the board's modules loaded.`);
  modules.push(module);
}

/** The board's loaded modules. */
export function getBoardModules(): ModuleHost {
  host ??= createModuleHost(modules);
  return host;
}

/** The board product, composed from its modules' canvas points. */
export function getBoardProduct(): CanvasProduct<BoardToolOptions> {
  product ??= composeProduct("board", getBoardModules(), boardCanvas);
  return product;
}

/** What the board editor provides to its chrome through `EditorModulesContext`. */
export function getBoardEditorModules(): EditorModules {
  editor ??= { host: getBoardModules(), points: boardEditor };
  return editor;
}
