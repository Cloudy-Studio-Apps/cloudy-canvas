import { Link } from "react-router";
import { Bot, Palette, Settings } from "lucide-react";

import { formatShortcut } from "@shared/core";
import { openAbout } from "@shared/about";
import { AgentServerMenu } from "@shared/agent-server";
import { CollaboratorStack } from "@shared/collaborators";
import { Wordmark } from "@shared/ui/brand/wordmark";
import { Button } from "@shared/ui/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { AppHeader } from "@shared/ui/layout/app-header";
import { SETTINGS_SHORTCUT } from "../home-shortcuts";
import { JoinSessionButton } from "./join-session-button";

export function TopBar() {
  return (
    <AppHeader
      actions={
        // <ThemeToggle /> returns here with dark mode (see FORCE_LIGHT_THEME).
        <>
          <CollaboratorStack className="mr-1" />
          <JoinSessionButton />
          <AgentServerMenu
            align="end"
            trigger={
              <Button variant="ghost" size="sm">
                <Bot />
                Agents
              </Button>
            }
          />
          {import.meta.env.DEV && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/design-system">
                <Palette />
                Design system
              </Link>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings" aria-keyshortcuts="Control+Comma">
                  <Settings />
                  Settings
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings ({formatShortcut(SETTINGS_SHORTCUT)})</TooltipContent>
          </Tooltip>
        </>
      }
    >
      <button
        type="button"
        aria-label="About Cloudy Canvas"
        className="-mx-1.5 cursor-pointer rounded-md px-1.5 py-1 hover:bg-hover"
        onClick={openAbout}
      >
        <Wordmark />
      </button>
    </AppHeader>
  );
}
