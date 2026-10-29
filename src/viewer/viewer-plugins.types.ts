import type * as React from "react";

import type { AppModule } from "@shared/core";

/** The `api` a plugin's `activateViewer` gets in the HTML viewer. */
export interface ViewerPluginApi {
  apiVersion: number;
  plugin: { id: string; manifest: { id: string; name: string } };
  core: object;
  canvas: object;
  board: object;
  libs: { React: typeof React };
}

/** The plugins' modules for the viewer, and the plugins that couldn't give them. */
export interface ViewerPluginModules {
  modules: AppModule[];
  /** Ids of the plugins whose `activateViewer` threw or returned something else. */
  failed: Set<string>;
}
