import { useEffect, useReducer } from "react";

import { localAssets, type LibraryAsset } from "@canvas";
import { useProjectLibrariesState } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { AssetSource } from "./assets-ui.types";

/** Whether the design can use a picture: made for any product or for designs. */
function forDesign(asset: LibraryAsset): boolean {
  return asset.kind === "any" || asset.kind === "design";
}

/**
 * The sources the tab lists, in order: each library the file uses (only pictures the design can
 * use), then the file itself. A file outside a project has only itself. Follows changes to the
 * libraries (from any editor) and to the file's own pictures.
 */
export function useAssetSources(): AssetSource[] {
  const engine = useDesignEngine();
  const { status, hub, libraries } = useProjectLibrariesState();
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const offs = [
      engine.doc.observeAssetIndex(refresh),
      ...(hub ? [hub.onChange(refresh)] : []),
      ...libraries.map((library) => library.observe(refresh)),
    ];
    return () => offs.forEach((off) => off());
  }, [engine, hub, libraries]);

  const entries = hub?.entries() ?? [];
  const fromLibraries: AssetSource[] = libraries.map((library) => ({
    key: library.id,
    libraryId: library.id,
    name: entries.find((entry) => entry.id === library.id)?.name ?? library.name(),
    editable: status === "ready",
    assets: library.assets().filter(forDesign),
  }));
  const local: AssetSource = {
    key: "file",
    libraryId: null,
    name: "",
    editable: true,
    assets: localAssets(engine.doc).filter(forDesign),
  };
  return [...fromLibraries, local];
}
