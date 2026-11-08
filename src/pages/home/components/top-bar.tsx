import { Link, useNavigate } from "react-router";
import { Bot, FolderKanban, Moon, Palette, Settings, Sun } from "lucide-react";

import { projectsSupported } from "@platform";
import { formatShortcut } from "@shared/core";
import { openAbout } from "@shared/about";
import { AgentServerMenu } from "@shared/agent-server";
import { CollaboratorStack } from "@shared/collaborators";
import { Wordmark } from "@shared/ui/brand/wordmark";
import { Button } from "@shared/ui/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { ThemeMenu, useActiveTheme } from "@shared/ui/theme";
import { AppHeader } from "@shared/ui/layout/app-header";
import { SETTINGS_SHORTCUT } from "../home-shortcuts";
import { JoinSessionButton } from "./join-session-button";
import { t } from "../home.i18n";

export function TopBar() {
  const navigate = useNavigate();
  const dark = useActiveTheme().resolved.appearance === "dark";
  return (
    <AppHeader
      actions={
        <>
          <CollaboratorStack className="mr-1" />
          <JoinSessionButton />
          {projectsSupported() && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">
                <FolderKanban />
                <span className="max-sm:sr-only">{t("top.projects")}</span>
              </Link>
            </Button>
          )}
          <AgentServerMenu
            align="end"
            trigger={
              <Button variant="ghost" size="sm">
                <Bot />
                <span className="max-sm:sr-only">{t("top.agents")}</span>
              </Button>
            }
          />
          {import.meta.env.DEV && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/design-system">
                <Palette />
                <span className="max-sm:sr-only">{t("top.designSystem")}</span>
              </Link>
            </Button>
          )}
          <ThemeMenu
            onOpenSettings={() => void navigate("/settings/appearance")}
            trigger={
              <Button variant="ghost" size="icon" aria-label={t("top.theme")}>
                {dark ? <Moon /> : <Sun />}
              </Button>
            }
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings" aria-keyshortcuts="Control+Comma">
                  <Settings />
                  <span className="max-sm:sr-only">{t("top.settings")}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("top.settings")} ({formatShortcut(SETTINGS_SHORTCUT)})
            </TooltipContent>
          </Tooltip>
        </>
      }
    >
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the wordmark opens About */}
      <button
        type="button"
        aria-label={t("top.about")}
        className="-mx-1.5 cursor-pointer rounded-md px-1.5 py-1 hover:bg-hover"
        onClick={openAbout}
      >
        <Wordmark textClassName="max-sm:sr-only" />
      </button>
    </AppHeader>
  );
}
