import { useProjectContext } from "../project-context";
import type { AssetTileProps } from "./asset-tile.types";
import { useLibraryAssetUrl } from "./use-library-asset-url";

/** A library picture: the image on a checkerboard-free surface, its name under it. */
export function AssetTile({ library, asset }: AssetTileProps) {
  const { libs } = useProjectContext();
  const url = useLibraryAssetUrl(libs.hub, library.entry.id, asset);
  return (
    <figure className="w-28 space-y-1">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-card border bg-surface">
        {url && <img src={url} alt={asset.name} className="max-h-full max-w-full object-contain" />}
      </div>
      <figcaption className="truncate text-xs text-muted-foreground" title={asset.name}>
        {asset.name}
      </figcaption>
    </figure>
  );
}
