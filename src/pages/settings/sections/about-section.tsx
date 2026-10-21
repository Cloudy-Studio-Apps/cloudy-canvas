import { Copy, ExternalLink } from "lucide-react";

import { clipboard, openExternal } from "@platform";
import type { AppInfo } from "@shared/core";
import { notifyError, toast } from "@shared/stores/toast-store";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { Button } from "@shared/ui/components/ui/button";
import { SettingsSection } from "../components/settings-section";
import { useAppInfo } from "../use-app-info";

const WEBSITE = "https://darkredgm.com/";
const BUILD_LABEL: Record<AppInfo["build"], string> = {
  development: "Development build",
  production: "Production build",
};

export function AboutSection() {
  const info = useAppInfo();
  const details = info
    ? [
        `Version ${info.version}`,
        info.tauriVersion && `Tauri ${info.tauriVersion}`,
        BUILD_LABEL[info.build],
      ].filter(Boolean)
    : [];

  const copyDetails = () =>
    void clipboard.writeText(`Cloudy Canvas · ${details.join(" · ")}`).then(
      () => toast({ title: "Version info copied" }),
      (error: unknown) => notifyError("Couldn't copy to the clipboard", error),
    );
  const openWebsite = () =>
    void openExternal(WEBSITE).catch((error: unknown) =>
      notifyError("The website couldn't be opened", error),
    );

  return (
    <SettingsSection id="about" title="About">
      <div className="flex flex-wrap items-center gap-5">
        <SealLogo size={72} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xl font-semibold tracking-tight">Cloudy Canvas</p>
          <p className="text-sm text-muted-foreground">
            Boards and designs on one canvas. Part of Cloudy Studio.
          </p>
          <p className="text-sm text-muted-foreground">
            {details.length > 0 ? details.join(" · ") : "Reading version…"}
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={!info} onClick={copyDetails}>
          <Copy />
          Copy version info
        </Button>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm">
          Made by <span className="font-semibold">DarkRedgm</span>
        </p>
        <Button variant="ghost" size="sm" onClick={openWebsite}>
          darkredgm.com
          <ExternalLink />
        </Button>
      </div>
    </SettingsSection>
  );
}
