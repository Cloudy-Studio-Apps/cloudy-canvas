import { Link } from "react-router";
import { ArrowLeft, Palette } from "lucide-react";

import { Badge } from "@shared/ui/components/ui/badge";
import { Button } from "@shared/ui/components/ui/button";
import { ThemeMenu, useActiveTheme } from "@shared/ui/theme";
import { AppHeader } from "@shared/ui/layout/app-header";
import { PageContainer } from "@shared/ui/layout/page-container";
import { ButtonsSection } from "./sections/buttons-section";
import { ComponentsSection } from "./sections/components-section";
import { KitSection } from "./sections/kit-section";
import { LogoSection } from "./sections/logo-section";
import { PaletteSection } from "./sections/palette-section";
import { SemanticTokensSection } from "./sections/semantic-tokens-section";
import { ShapeSection } from "./sections/shape-section";
import { TypographySection } from "./sections/typography-section";

/** Dev-only living reference of the design system. */
export function DesignSystemPage() {
  const theme = useActiveTheme();
  return (
    <div className="min-h-full">
      <AppHeader
        actions={
          <>
            <ThemeMenu
              trigger={
                <Button variant="outline" size="sm">
                  <Palette />
                  {theme.definition.label}
                </Button>
              }
            />
            <Badge variant="outline">dev only</Badge>
          </>
        }
      >
        <Button variant="ghost" size="icon" asChild>
          <Link to="/" aria-label="Back to home">
            <ArrowLeft />
          </Link>
        </Button>
        <span className="font-semibold tracking-tight">Design system</span>
      </AppHeader>

      <PageContainer as="main" className="space-y-14 py-10">
        <LogoSection />
        <PaletteSection />
        <SemanticTokensSection />
        <TypographySection />
        <ShapeSection />
        <ButtonsSection />
        <ComponentsSection />
        <KitSection />
      </PageContainer>
    </div>
  );
}
