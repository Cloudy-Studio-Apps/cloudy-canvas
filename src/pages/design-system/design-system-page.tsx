import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { AppHeader } from "@ui/layout/app-header";
import { PageContainer } from "@ui/layout/page-container";
import { ButtonsSection } from "./sections/buttons-section";
import { ComponentsSection } from "./sections/components-section";
import { LogoSection } from "./sections/logo-section";
import { PaletteSection } from "./sections/palette-section";
import { SemanticTokensSection } from "./sections/semantic-tokens-section";
import { ShapeSection } from "./sections/shape-section";
import { TypographySection } from "./sections/typography-section";

/** Dev-only living reference of the design system. */
export function DesignSystemPage() {
  return (
    <div className="min-h-full">
      <AppHeader actions={<Badge variant="outline">dev only</Badge>}>
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
      </PageContainer>
    </div>
  );
}
