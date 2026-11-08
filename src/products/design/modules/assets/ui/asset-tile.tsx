import type { PointerEvent } from "react";

import { ListRow, cn } from "@shared/ui/kit";
import { LibraryBadge } from "@canvas-ui";
import type { AssetTileProps } from "./assets-ui.types";
import { LocalAssetMenu } from "./local-asset-menu";
import { useAssetUrl } from "./use-asset-url";

/**
 * A picture of a source, as a thumbnail (grid) or a row (list). Drag it onto the canvas, or
 * double-click to place it in the view; the file's own pictures have a right-click menu.
 */
export function AssetTile({ source, asset, view, depth, actions, drag, local }: AssetTileProps) {
  const ref = { source, asset };
  const url = useAssetUrl(ref, actions);
  const thumb = url ? (
    <img src={url} alt="" draggable={false} className="size-full object-contain" />
  ) : null;
  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => drag.press(event, ref),
    onDoubleClick: () => void actions.place(ref),
    title: asset.group ? `${asset.group}/${asset.name}` : asset.name,
  };
  const tile =
    view === "grid" ? (
      <div
        {...handlers}
        className="group/tile flex min-w-0 cursor-grab flex-col gap-1 rounded-md p-1 hover:bg-hover"
      >
        <div
          className={cn(
            "flex aspect-square items-center justify-center overflow-hidden rounded-sm border bg-surface p-1",
            !url && "animate-pulse",
          )}
        >
          {thumb}
        </div>
        <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
          <span className="truncate">{asset.name}</span>
          {source.libraryId !== null && <LibraryBadge name={source.name} />}
        </span>
      </div>
    ) : (
      <ListRow
        {...handlers}
        depth={depth}
        icon={<span className="flex size-5 items-center justify-center">{thumb}</span>}
        label={asset.name}
        meta={asset.ext.toUpperCase()}
        className="cursor-grab"
      />
    );
  if (source.libraryId !== null) return tile;
  return (
    <LocalAssetMenu asset={asset} local={local}>
      {tile}
    </LocalAssetMenu>
  );
}
