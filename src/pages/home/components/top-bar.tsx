import { Link } from "react-router";
import { Bot, Palette } from "lucide-react";

import { AgentServerMenu } from "@shared/agent-server";
import { Wordmark } from "@shared/ui/brand/wordmark";
import { Button } from "@shared/ui/components/ui/button";
import { AppHeader } from "@shared/ui/layout/app-header";

export function TopBar() {
  return (
    <AppHeader
      actions={
        // <ThemeToggle /> returns here with dark mode (see FORCE_LIGHT_THEME).
        <>
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
        </>
      }
    >
      <Wordmark />
    </AppHeader>
  );
}
