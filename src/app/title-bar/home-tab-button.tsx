import { House } from "lucide-react";

import { fileTabs } from "../tabs/file-tabs-instance";
import { cn } from "@shared/ui/lib/utils";
import { t } from "./title-bar.i18n";
import type { HomeTabButtonProps } from "./title-bar.types";

/** The Home tab: icon only, first, never closed or moved. */
export function HomeTabButton({ active }: HomeTabButtonProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a tab, not a toolbar button
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={t("home")}
      title={t("home")}
      onClick={() => fileTabs.activate(null)}
      className={cn(
        "relative flex h-full w-10 shrink-0 cursor-pointer items-center justify-center rounded-t-md text-muted-foreground transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40",
        active && "bg-background text-foreground hover:bg-background",
      )}
    >
      {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}
      <House className="size-4" />
    </button>
  );
}
