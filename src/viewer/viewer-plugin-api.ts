import React from "react";

import * as board from "@board";
import * as canvas from "@canvas";
import * as core from "@shared/core";
import { PLUGIN_API_VERSION } from "@shared/core";
import type { ViewerPlugin } from "@board/modules/viewer";
import type { ViewerPluginApi } from "./viewer-plugins.types";

/**
 * What `activateViewer(api)` gets: the engine side of the app (no editor, no platform), the
 * plugin's id and name, and React for a part's panel. See docs/plugins.md, In the HTML export.
 */
export function createViewerPluginApi(plugin: ViewerPlugin): ViewerPluginApi {
  return {
    apiVersion: PLUGIN_API_VERSION,
    plugin: { id: plugin.id, manifest: { id: plugin.id, name: plugin.name } },
    core: { ...core },
    canvas: { ...canvas },
    board: { ...board },
    libs: { React },
  };
}
