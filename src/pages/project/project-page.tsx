import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { useProjectsStore } from "@shared/stores/projects-store";
import { Button } from "@shared/ui/kit";
import { AppHeader } from "@shared/ui/layout/app-header";
import { PageContainer } from "@shared/ui/layout/page-container";
import { t } from "./project.i18n";

/** `/project/:id`: a project's home. For now only its name; the files come next. */
export function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === id));
  const refresh = useProjectsStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader>
        <Button variant="ghost" size="sm" onClick={() => void navigate("/projects")}>
          <ArrowLeft />
          {t("back")}
        </Button>
      </AppHeader>
      <PageContainer as="main" className="flex-1 pt-10 pb-16">
        {project ? (
          <h1 className="text-2xl font-semibold">{project.name}</h1>
        ) : (
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
        )}
      </PageContainer>
    </div>
  );
}
