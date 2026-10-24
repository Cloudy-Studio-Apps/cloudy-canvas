import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { AppHeader } from "@shared/ui/layout/app-header";
import { PageContainer } from "@shared/ui/layout/page-container";
import { AboutSection } from "./sections/about-section";
import { AgentsSection } from "./sections/agents-section";
import { CollaborationSection } from "./sections/collaboration";
import { DedicationCard } from "./sections/dedication-card";
import { FilesSection } from "./sections/files-section";
import { PluginsSection } from "./sections/plugins";
import { ShortcutsSection } from "./sections/shortcuts-section";

export function SettingsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft />
            Home
          </Link>
        </Button>
        <span className="text-md font-semibold tracking-tight">Settings</span>
      </AppHeader>
      <PageContainer as="main" className="max-w-3xl flex-1 space-y-6 pt-10 pb-16">
        <AboutSection />
        <DedicationCard />
        <CollaborationSection />
        <AgentsSection />
        <FilesSection />
        <PluginsSection />
        <ShortcutsSection />
      </PageContainer>
    </div>
  );
}
