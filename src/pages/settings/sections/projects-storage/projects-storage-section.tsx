import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { projectFs } from "@platform";
import { formatSize, type ProjectRecord, type ProjectSizes } from "@shared/core";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError } from "@shared/stores/toast-store";
import { Button, ConfirmDialog } from "@shared/ui/kit";
import { SettingsSection } from "../../components/settings-section";
import { ProjectsFolderField } from "./projects-folder-field";
import { ProjectsTable } from "./projects-table";
import { SpaceBar } from "./space-bar";
import { useProjectSizes } from "./use-project-sizes";
import { t } from "../../settings.i18n";

const NONE: ProjectSizes = { files: 0, libraries: 0, trash: 0, total: 0, trashItems: 0 };

/** Settings › Projects & storage: where new projects go, the space they use and their trash. */
export function ProjectsStorageSection() {
  const projects = useProjectsStore((s) => s.projects);
  const missing = useProjectsStore((s) => s.missing);
  const refresh = useProjectsStore((s) => s.refresh);
  const { sizes, reload } = useProjectSizes(projects, missing);
  // The project whose trash is being emptied; "all" is every project's.
  const [emptying, setEmptying] = useState<ProjectRecord | "all" | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    const sum = { ...NONE };
    for (const s of sizes.values()) {
      sum.files += s.files;
      sum.libraries += s.libraries;
      sum.trash += s.trash;
      sum.total += s.total;
      sum.trashItems += s.trashItems;
    }
    return sum;
  }, [sizes]);

  const empty = async (target: ProjectRecord | "all") => {
    const list = target === "all" ? projects.filter((p) => sizes.get(p.id)?.trashItems) : [target];
    try {
      for (const project of list) await projectFs.removeFromTrash(project.root, "all");
    } catch (error) {
      notifyError(t("storage.emptyFailed"), error);
    }
    reload();
  };

  return (
    <SettingsSection id="projects" title={t("nav.projects")} description={t("storage.description")}>
      <div className="space-y-6">
        <ProjectsFolderField />
        <SpaceBar sizes={totals} />
        <ProjectsTable projects={projects} sizes={sizes} onEmpty={setEmptying} />
        <div className="flex items-center gap-2">
          <span className="grow text-sm text-muted-foreground">{t("storage.keptHint")}</span>
          <Button
            variant="destructive"
            size="sm"
            disabled={totals.trashItems === 0}
            onClick={() => setEmptying("all")}
          >
            <Trash2 />
            {t("storage.emptyAll", { size: formatSize(totals.trash) })}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={emptying !== null}
        onOpenChange={(open) => !open && setEmptying(null)}
        title={t("storage.confirmTitle")}
        description={
          emptying === "all" || emptying === null
            ? t("storage.confirmAll", { size: formatSize(totals.trash) })
            : t("storage.confirmOne", { name: emptying.name })
        }
        confirmLabel={t("storage.emptyTrash")}
        destructive
        onConfirm={() => emptying !== null && void empty(emptying)}
      />
    </SettingsSection>
  );
}
