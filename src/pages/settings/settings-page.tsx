import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { AppHeader } from "@shared/ui/layout/app-header";
import { SettingsNav } from "./components/settings-nav";
import { findSettingsSection, SETTINGS_SECTIONS } from "./settings-sections";

export function SettingsPage() {
  const { section } = useParams();
  const entry = section === undefined ? SETTINGS_SECTIONS[0] : findSettingsSection(section);
  if (!entry) return <Navigate to="/settings" replace />;
  const Section = entry.component;

  return (
    <div className="flex h-full flex-col">
      <AppHeader>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft />
            Home
          </Link>
        </Button>
        <span className="text-md font-semibold tracking-tight">Settings</span>
      </AppHeader>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SettingsNav />
        {/* Keyed so each section opens scrolled to its top. */}
        <main key={entry.id} className="min-w-0 flex-1 overflow-y-auto">
          <div className="max-w-3xl px-6 pt-8 pb-16 md:px-10">
            <Section />
          </div>
        </main>
      </div>
    </div>
  );
}
