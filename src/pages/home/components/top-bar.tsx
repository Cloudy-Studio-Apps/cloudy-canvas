import { Link } from "react-router";
import { Bot, Palette } from "lucide-react";

import { AgentServerMenu } from "@pages/agent-server";
import { Wordmark } from "@ui/brand/wordmark";
import { Button } from "@ui/components/ui/button";
import { AppHeader } from "@ui/layout/app-header";

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
