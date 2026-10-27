import { Component } from "lucide-react";

import { PanelSection } from "@design/ui/components/panel";
import { t } from "../assets.i18n";

/** The left panel's Assets tab: components and libraries, once they exist. */
export function AssetsTab() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <PanelSection title={t("local.title")} className="border-b-0">
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="flex size-9 items-center justify-center rounded-md bg-design-soft text-design-foreground">
            <Component className="size-4" />
          </span>
          <p className="max-w-44 text-xs text-muted-foreground">{t("local.empty")}</p>
        </div>
      </PanelSection>
    </div>
  );
}
