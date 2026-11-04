import { Database } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import type { LayerBadgeProps } from "@design/ui/modules";
import { dataCopyTag, repeatOf } from "../../repeat";
import { t } from "../../data.i18n";

/** In the layers panel: a layer an iterator made for one row, which follows its template. */
export function DataCopyBadge({ node }: LayerBadgeProps) {
  const engine = useDesignEngine();
  const tag = dataCopyTag(node);
  if (!tag) return null;
  const frame = engine.doc.get(tag.iterator);
  const label = t("copy.badge", { source: (frame && repeatOf(frame)?.source) ?? "" });
  return (
    <span
      title={label}
      aria-label={label}
      className="flex shrink-0 text-subtle-foreground [&_svg]:size-3"
    >
      <Database />
    </span>
  );
}
