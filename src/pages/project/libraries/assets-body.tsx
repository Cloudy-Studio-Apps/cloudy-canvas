import { AssetTile } from "./asset-tile";
import type { AssetsBodyProps } from "./kind-body.types";
import { t } from "../project.i18n";

/** A library's pictures (or SVGs and icons) as tiles. */
export function AssetsBody({ library, assets, kind }: AssetsBodyProps) {
  if (assets.length === 0)
    return <p className="text-sm text-muted-foreground">{t(`libraries.empty.${kind}`)}</p>;
  return (
    <div className="flex flex-wrap gap-3">
      {assets.map((asset) => (
        <AssetTile key={asset.id} library={library} asset={asset} />
      ))}
    </div>
  );
}
