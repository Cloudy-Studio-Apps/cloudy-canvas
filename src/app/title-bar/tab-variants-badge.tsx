import { Columns3 } from "lucide-react";
import { useSyncExternalStore } from "react";

import { variantChoices } from "@canvas-ui";
import { t } from "./title-bar.i18n";
import type { TabVariantsBadgeProps } from "./title-bar.types";

/** On a tab where an agent waits for the user to pick one of its variants. */
export function TabVariantsBadge({ tab }: TabVariantsBadgeProps) {
  const waiting = useSyncExternalStore(
    variantChoices.store.subscribe,
    () => variantChoices.pending(tab.id) !== null,
  );
  if (!waiting) return null;
  return (
    <Columns3
      role="img"
      aria-label={t("variantsWaiting")}
      className="size-3.5 shrink-0 animate-pulse text-primary"
    />
  );
}
