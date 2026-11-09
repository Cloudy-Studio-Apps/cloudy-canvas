import { useState } from "react";

import type { Point } from "@canvas";

import { DragGhost } from "@canvas-ui";
import { useDropOnCanvas } from "@design/ui/hooks";
import { useDesignPanelStore } from "@design/ui/stores/design-panel-store";
import { AddAssetMenu } from "./add-asset-menu";
import { AssetSourceSection } from "./asset-source-section";
import { filterAssets } from "./asset-tree";
import { AssetsToolbar } from "./assets-toolbar";
import type { AssetFilter, AssetRef } from "./assets-ui.types";
import { useAssetActions } from "./use-asset-actions";
import { useAssetSources } from "./use-asset-sources";
import { useLocalAssetActions } from "./use-local-asset-actions";
import { useUploadAssets } from "./use-upload-assets";
import { t } from "../assets.i18n";

/**
 * The left panel's Assets tab: the pictures of each library the file's project has, then the
 * file's own, in groups by slash path (search, a type filter, grid or list). Drag one onto the
 * canvas, or double-click it, to place it; the "+" uploads pictures to a library or the file.
 */
export function AssetsTab() {
  const view = useDesignPanelStore((state) => state.assetsView);
  const setView = useDesignPanelStore((state) => state.setAssetsView);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AssetFilter>("all");
  const [group, setGroup] = useState("");
  const sources = useAssetSources();
  const actions = useAssetActions();
  const local = useLocalAssetActions();
  const upload = useUploadAssets();
  const drag = useDropOnCanvas<AssetRef, Point>({
    onDrop: (ref, _target, world) => void actions.place(ref, world),
  });

  const searching = query.trim() !== "" || filter !== "all";
  const shown = sources.map((source) => ({
    source,
    assets: filterAssets(source.assets, query, filter),
  }));
  const none = searching && shown.every(({ assets }) => assets.length === 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AssetsToolbar
        query={query}
        onQuery={setQuery}
        view={view}
        onView={setView}
        filter={filter}
        onFilter={setFilter}
        add={
          <AddAssetMenu
            sources={sources}
            group={group}
            onGroup={setGroup}
            onUpload={(libraryId) => void upload(libraryId, group)}
          />
        }
      />
      <div className="min-h-0 flex-1 divide-y overflow-y-auto">
        {none ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">{t("empty.search")}</p>
        ) : (
          shown.map(({ source, assets }) => (
            <AssetSourceSection
              key={source.key}
              source={source}
              assets={assets}
              view={view}
              searching={searching}
              actions={actions}
              drag={drag}
              local={local}
            />
          ))
        )}
      </div>
      {drag.drag && (
        <DragGhost
          label={drag.drag.over ? drag.drag.payload.asset.name : t("drag.dropHere")}
          pointer={drag.drag.pointer}
          muted={!drag.drag.over}
        />
      )}
      {local.dialogs}
    </div>
  );
}
