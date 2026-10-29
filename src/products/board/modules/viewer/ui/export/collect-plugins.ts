import { loadedPlugins } from "@shared/core";
import type { ViewerPlugin } from "../../viewer-file.types";

/**
 * The code of every loaded plugin that draws in the viewer (`activateViewer`), with the element
 * types of it on the board. Those without elements come too: a plugin on the board may require them.
 */
export function collectPlugins(
  pluginTypes: ReadonlyMap<string, ReadonlySet<string>>,
): ViewerPlugin[] {
  return loadedPlugins
    .all()
    .flatMap(({ id, name, viewerCode }) =>
      viewerCode ? [{ id, name, code: viewerCode, types: [...(pluginTypes.get(id) ?? [])] }] : [],
    );
}
