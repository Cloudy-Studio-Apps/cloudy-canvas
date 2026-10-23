import { Copy, Scale } from "lucide-react";

import {
  AUTHOR,
  copyVersionDetails,
  LinkButton,
  openAbout,
  useAppInfo,
  versionDetails,
  WEBSITE_URL,
} from "@shared/about";
import { CheckUpdatesButton } from "@shared/app-updates";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { Button } from "@shared/ui/components/ui/button";
import { SettingsSection } from "../components/settings-section";

export function AboutSection() {
  const info = useAppInfo();
  const details = versionDetails(info);

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
        <Button
          variant="outline"
          size="sm"
          disabled={!info}
          onClick={() => copyVersionDetails(details)}
        >
          <Copy />
          Copy version info
        </Button>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <CheckUpdatesButton />
        <Button variant="ghost" size="sm" onClick={openAbout}>
          <Scale />
          License & disclaimer
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm">
          Made by <span className="font-semibold">{AUTHOR}</span>
        </p>
        <LinkButton href={WEBSITE_URL}>darkredgm.com</LinkButton>
      </div>
    </SettingsSection>
  );
}
