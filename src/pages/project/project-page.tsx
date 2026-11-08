import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Wordmark } from "@shared/ui/brand/wordmark";
import { Button, EmptyState } from "@shared/ui/kit";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError } from "@shared/stores/toast-store";
import { AppHeader } from "@shared/ui/layout/app-header";
import { ProjectHome } from "./project-home";
import { useProject } from "./use-project";
import { t } from "./project.i18n";

/** `/project/:id[?folder=<rel>]`: a project's home, with its folders and files. */
export function ProjectPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const project = useProject(id);

  const locate = async () => {
    try {
      await useProjectsStore.getState().locate(id);
    } catch (error) {
      notifyError(t("page.locateFailed"), error);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <AppHeader>
        <Button variant="ghost" size="sm" onClick={() => void navigate("/projects")}>
          <ArrowLeft />
          {t("back")}
        </Button>
        <Wordmark textClassName="max-sm:sr-only" />
      </AppHeader>
      {project.status === "ready" && <ProjectHome project={project} />}
      {project.status === "notFound" && (
        <EmptyState title={t("notFound")} className="mx-auto max-w-md py-16" />
      )}
      {project.status === "missing" && (
        <EmptyState
          title={t("page.missingTitle")}
          description={t("page.missingText")}
          action={
            <Button variant="outline" onClick={() => void locate()}>
              {t("page.locate")}
            </Button>
          }
          className="mx-auto max-w-md py-16"
        />
      )}
    </div>
  );
}
