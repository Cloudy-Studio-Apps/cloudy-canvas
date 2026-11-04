import { LayoutTemplate } from "lucide-react";

import type { LayerBadgeProps } from "@design/ui/modules";
import { useMasterOf } from "./use-master-of";
import { t } from "../../catalog.i18n";

/** In the layers panel: a layer that's a brochure master's copy, locked on its page. */
export function FromMasterBadge({ node }: LayerBadgeProps) {
  const from = useMasterOf(node);
  if (!from) return null;
  const label = t("design.fromMaster", { master: from.master });
  return (
    <span
      title={label}
      aria-label={label}
      className="flex shrink-0 text-subtle-foreground [&_svg]:size-3"
    >
      <LayoutTemplate />
    </span>
  );
}
