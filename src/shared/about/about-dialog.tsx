import { Code, Copy } from "lucide-react";

import { APP_REPOSITORY_URL } from "@shared/core";
import { ChangelogButton, CheckUpdatesButton } from "@shared/app-updates";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { SealsVideo } from "@shared/ui/brand/seals-video";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import {
  AUTHOR,
  COPYRIGHT,
  CREDITS,
  DISCLAIMER,
  LICENSE_NAME,
  TAGLINE,
  WEBSITE_URL,
} from "./about-content";
import { AboutBlock } from "./about-block";
import { useAboutStore } from "./about-store";
import { LinkButton } from "./link-button";
import { useAppInfo } from "./use-app-info";
import { copyVersionDetails, versionDetails } from "./version-details";
import { t } from "./about.i18n";

/** The app's logo, version, license, disclaimer and credits. Mounted once; see `openAbout`. */
export function AboutDialog() {
  const open = useAboutStore((s) => s.open);
  const setOpen = useAboutStore((s) => s.setOpen);
  const info = useAppInfo();
  const details = versionDetails(info);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <div className="aspect-video shrink-0 overflow-hidden border-b bg-surface-sunken">
          <SealsVideo playing={open} />
        </div>
        <DialogHeader className="items-center gap-2 px-6 pt-6 pb-5 text-center sm:text-center">
          <DialogTitle className="flex items-center gap-2 text-xl tracking-tight">
            <SealLogo size={32} />
            Cloudy Canvas
          </DialogTitle>
          <DialogDescription>{TAGLINE}</DialogDescription>
          <p className="text-xs text-muted-foreground">
            {details.length > 0 ? details.join(" · ") : t("reading")}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <CheckUpdatesButton />
            <ChangelogButton />
            <Button
              variant="ghost"
              size="sm"
              disabled={!info}
              onClick={() => copyVersionDetails(details)}
            >
              <Copy />
              {t("copy")}
            </Button>
          </div>
        </DialogHeader>

        <AboutBlock title={t("license.title")}>
          <p>{t("license.body", { copyright: COPYRIGHT, license: LICENSE_NAME })}</p>
          <div className="flex flex-wrap gap-1">
            <LinkButton href={`${APP_REPOSITORY_URL}/blob/master/LICENSE`}>
              {t("license.read")}
            </LinkButton>
            <LinkButton href={APP_REPOSITORY_URL} icon={Code}>
              {t("license.source")}
            </LinkButton>
          </div>
        </AboutBlock>

        <AboutBlock title={t("disclaimer.title")}>
          {DISCLAIMER.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </AboutBlock>

        <AboutBlock title={t("credits.title")}>
          <ul className="space-y-1">
            {CREDITS.map((credit) => (
              <li key={credit.name}>
                <span className="font-medium text-foreground">{credit.name}</span>
                {` ${t("credits.by", { name: credit.by, license: credit.license })}`}
              </li>
            ))}
          </ul>
        </AboutBlock>

        <div className="flex items-center justify-between gap-3 border-t px-6 py-4 text-sm">
          <span>{t("madeBy", { author: AUTHOR })}</span>
          <LinkButton href={WEBSITE_URL}>darkredgm.com</LinkButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
