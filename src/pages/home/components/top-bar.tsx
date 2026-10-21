import { Link } from "react-router";
import { Palette } from "lucide-react";

import { Wordmark } from "@ui/brand/wordmark";
import { Button } from "@ui/components/ui/button";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-10">
        <Wordmark />
        {/* <ThemeToggle /> returns with dark mode (see FORCE_LIGHT_THEME). */}
        {import.meta.env.DEV && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/design-system">
              <Palette />
              Design system
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
