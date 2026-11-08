import { useState } from "react";

import { TokenSourceHeader } from "@canvas-ui";
import { assetTree } from "./asset-tree";
import { AssetGroup } from "./asset-group";
import type { AssetSourceSectionProps } from "./assets-ui.types";
import { t } from "../assets.i18n";

/**
 * A source's pictures (a library the file uses, or the file itself) under its heading, in
 * collapsible groups by slash path. A source with nothing to show says so, unless a search
 * filtered everything out.
 */
export function AssetSourceSection({ source, assets, ...props }: AssetSourceSectionProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (path: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(path)) next.add(path);
      return next;
    });
  if (assets.length === 0 && props.searching) return null;
  return (
    <section className="flex flex-col gap-1 px-2 py-2">
      <TokenSourceHeader source={source} note={source.libraryId !== null && !source.editable} />
      {assets.length === 0 ? (
        <p className="py-1 text-xs text-subtle-foreground">
          {source.libraryId === null ? t("empty.file") : t("empty.library")}
        </p>
      ) : (
        <AssetGroup
          node={assetTree(assets)}
          depth={0}
          source={source}
          open={open}
          toggle={toggle}
          {...props}
        />
      )}
    </section>
  );
}
