import { Link } from "react-router";
import { Palette } from "lucide-react";

import { Wordmark } from "@ui/brand/wordmark";
import { Button } from "@ui/components/ui/button";
import { AppHeader } from "@ui/layout/app-header";

export function TopBar() {
  return (
    <AppHeader
      actions={
        // <ThemeToggle /> returns here with dark mode (see FORCE_LIGHT_THEME).
        import.meta.env.DEV && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/design-system">
              <Palette />
              Design system
            </Link>
          </Button>
        )
      }
    >
      <Wordmark />
    </AppHeader>
  );
}
