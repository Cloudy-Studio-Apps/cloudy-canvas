import { ChevronRight } from "lucide-react";

import { cn } from "@shared/ui/kit";
import { countAssets } from "./asset-tree";
import { AssetTile } from "./asset-tile";
import type { AssetGroupProps } from "./assets-ui.types";

/**
 * One group of pictures (a slash path) and the groups inside it: the pictures right in it first,
 * as a grid or rows, then its own groups. The root (no path) has no header.
 */
export function AssetGroup({ node, depth, open, toggle, searching, ...props }: AssetGroupProps) {
  const expanded = node.path === "" || searching || open.has(node.path);
  const tiles = (
    <div className={props.view === "grid" ? "grid grid-cols-3 gap-0.5" : "flex flex-col"}>
      {node.assets.map((asset) => (
        <AssetTile key={asset.id} asset={asset} depth={depth} {...props} />
      ))}
    </div>
  );
  const children = (
    <>
      {node.assets.length > 0 && tiles}
      {node.groups.map((group) => (
        <AssetGroup
          key={group.path}
          node={group}
          depth={depth + 1}
          open={open}
          toggle={toggle}
          searching={searching}
          {...props}
        />
      ))}
    </>
  );
  if (node.path === "") return <div className="flex flex-col gap-1">{children}</div>;
  return (
    <div className="flex flex-col">
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the group's fold header */}
      <button
        type="button"
        onClick={() => toggle(node.path)}
        aria-expanded={expanded}
        className="flex h-7 min-w-0 items-center gap-1 rounded-md pr-1 text-left text-xs font-medium hover:bg-hover"
        style={{ paddingLeft: Math.max(depth - 1, 0) * 12 }}
      >
        <ChevronRight
          className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", {
            "rotate-90": expanded,
          })}
        />
        <span className="truncate">{node.name}</span>
        <span className="text-subtle-foreground">{countAssets(node)}</span>
      </button>
      {expanded && (
        <div className="flex flex-col gap-1" style={{ paddingLeft: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}
