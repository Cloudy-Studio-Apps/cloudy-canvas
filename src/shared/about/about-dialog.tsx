import { Code, Copy } from "lucide-react";

import { APP_REPOSITORY_URL } from "@shared/core";
import { CheckUpdatesButton } from "@shared/app-updates";
import { SealLogo } from "@shared/ui/brand/seal-logo";
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

/** The app's logo, version, license, disclaimer and credits. Mounted once; see `openAbout`. */
export function AboutDialog() {
  const open = useAboutStore((s) => s.open);
  const setOpen = useAboutStore((s) => s.setOpen);
  const info = useAppInfo();
  const details = versionDetails(info);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="items-center gap-2 px-6 pt-8 pb-5 text-center sm:text-center">
          <SealLogo size={80} />
          <DialogTitle className="text-xl tracking-tight">Cloudy Canvas</DialogTitle>
          <DialogDescription>{TAGLINE}</DialogDescription>
          <p className="text-xs text-muted-foreground">
            {details.length > 0 ? details.join(" · ") : "Reading version…"}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <CheckUpdatesButton />
            <Button
              variant="ghost"
              size="sm"
              disabled={!info}
              onClick={() => copyVersionDetails(details)}
            >
              <Copy />
              Copy version info
            </Button>
          </div>
        </DialogHeader>

        <AboutBlock title="License">
          <p>
            {COPYRIGHT}. Cloudy Canvas is free software under the {LICENSE_NAME}: you may use,
            study, change and share it under its terms.
          </p>
          <div className="flex flex-wrap gap-1">
            <LinkButton href={`${APP_REPOSITORY_URL}/blob/master/LICENSE`}>
              Read the license
            </LinkButton>
            <LinkButton href={APP_REPOSITORY_URL} icon={Code}>
              Source code
            </LinkButton>
          </div>
        </AboutBlock>

        <AboutBlock title="Disclaimer">
          {DISCLAIMER.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </AboutBlock>

        <AboutBlock title="Credits">
          <ul className="space-y-1">
            {CREDITS.map((credit) => (
              <li key={credit.name}>
                <span className="font-medium text-foreground">{credit.name}</span>
                {` by ${credit.by} · ${credit.license}`}
              </li>
            ))}
          </ul>
        </AboutBlock>

        <div className="flex items-center justify-between gap-3 border-t px-6 py-4 text-sm">
          <span>
            Made by <span className="font-semibold">{AUTHOR}</span>
          </span>
          <LinkButton href={WEBSITE_URL}>darkredgm.com</LinkButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
