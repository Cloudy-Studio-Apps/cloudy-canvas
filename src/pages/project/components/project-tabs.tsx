import { Tabs, TabsList, TabsTrigger } from "@shared/ui/kit";
import type { ProjectTab, ProjectTabsProps } from "./project-tabs.types";
import { t } from "../project.i18n";

/** Files · Libraries · Trash. */
export function ProjectTabs({ value, onChange }: ProjectTabsProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as ProjectTab)}>
      <TabsList>
        <TabsTrigger value="files">{t("tabs.files")}</TabsTrigger>
        <TabsTrigger value="libraries">{t("tabs.libraries")}</TabsTrigger>
        <TabsTrigger value="trash">{t("tabs.trash")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
