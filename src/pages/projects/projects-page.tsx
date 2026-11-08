import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, FolderKanban, Plus } from "lucide-react";

import { AppHeader } from "@shared/ui/layout/app-header";
import { PageContainer } from "@shared/ui/layout/page-container";
import { Wordmark } from "@shared/ui/brand/wordmark";
import { Button, EmptyState, SearchInput } from "@shared/ui/kit";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { ProjectRecord } from "@shared/core";
import { NewProjectDialog } from "./components/new-project-dialog";
import { OpenProjectMenu } from "./components/open-project-menu";
import { ProjectGrid } from "./components/project-grid";
import { useOpenProject } from "./use-open-project";
import { t } from "./projects.i18n";

/** `/projects`: the projects this device knows, pinned first, with New project and Open project. */
export function ProjectsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const projects = useProjectsStore((s) => s.projects);
  const missing = useProjectsStore((s) => s.missing);
  const refresh = useProjectsStore((s) => s.refresh);
  const { openRecord, openFile, openFolder } = useOpenProject();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(params.has("new"));

  // Re-check on focus too: a folder moved back (or away) while the app was in the background.
  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // Home's "New project" arrives as `?new`, which is consumed once the dialog is showing.
  useEffect(() => {
    if (params.has("new")) setParams({}, { replace: true });
  }, [params, setParams]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(needle));
  }, [projects, query]);
  const pinned = shown.filter((p) => p.pinned);
  const others = shown.filter((p) => !p.pinned);

  const locate = async (project: ProjectRecord) => {
    try {
      await useProjectsStore.getState().locate(project.id);
    } catch (error) {
      notifyError(t("card.locateFailed"), error);
    }
  };
  const forget = async (project: ProjectRecord) => {
    await useProjectsStore.getState().forget(project.id);
    toast({ title: t("card.forgotten", { name: project.name }) });
  };
  const actions = {
    onOpen: (p: ProjectRecord) => void openRecord(p),
    onLocate: (p: ProjectRecord) => void locate(p),
    onForget: (p: ProjectRecord) => void forget(p),
    onTogglePin: (p: ProjectRecord) => void useProjectsStore.getState().setPinned(p.id, !p.pinned),
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader>
        <Button variant="ghost" size="sm" onClick={() => void navigate("/")}>
          <ArrowLeft />
          {t("page.home")}
        </Button>
        <Wordmark textClassName="max-sm:sr-only" />
      </AppHeader>
      <PageContainer as="main" className="flex-1 space-y-8 pt-10 pb-16">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold">{t("page.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.description")}</p>
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("page.search")}
            className="w-56"
          />
          <OpenProjectMenu
            onOpenFile={() => void openFile()}
            onOpenFolder={() => void openFolder()}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus />
            {t("new")}
          </Button>
        </div>
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban />}
            title={t("empty.title")}
            description={t("empty.description")}
            className="mx-auto max-w-md py-16"
          />
        ) : shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("page.noMatches", { query: query.trim() })}
          </p>
        ) : (
          <>
            <ProjectGrid
              title={t("page.pinned")}
              projects={pinned}
              missing={missing}
              {...actions}
            />
            <ProjectGrid title={t("page.all")} projects={others} missing={missing} {...actions} />
          </>
        )}
      </PageContainer>
      <NewProjectDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(project) => void navigate(`/project/${project.id}`)}
      />
    </div>
  );
}
