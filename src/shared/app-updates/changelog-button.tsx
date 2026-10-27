import { ScrollText } from "lucide-react";

import { openWhatsNew } from "@shared/stores/whats-new-store";
import { Button } from "@shared/ui/components/ui/button";
import type { ChangelogButtonProps } from "./changelog-button.types";
import { t } from "./app-updates.i18n";

/** Opens every version's changes. */
export function ChangelogButton({ className }: ChangelogButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => openWhatsNew({ kind: "history" })}
    >
      <ScrollText />
      {t("changelog")}
    </Button>
  );
}
