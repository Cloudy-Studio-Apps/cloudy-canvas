import { useProjectContext } from "../project-context";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/kit";
import type { ProjectTab, ProjectTabsProps } from "./project-tabs.types";
import { t } from "../project.i18n";

/** Files · Libraries · Trash. */
export function ProjectTabs({ value, onChange }: ProjectTabsProps) {
  const { trash } = useProjectContext();
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as ProjectTab)}>
      <TabsList>
        <TabsTrigger value="files">{t("tabs.files")}</TabsTrigger>
        <TabsTrigger value="libraries">{t("tabs.libraries")}</TabsTrigger>
        <TabsTrigger value="trash">
          {t("tabs.trash")}
          {trash.count > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{trash.count}</span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
