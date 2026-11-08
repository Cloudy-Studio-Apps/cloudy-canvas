import type { ProjectGridProps } from "./project-grid.types";
import { ProjectCard } from "./project-card";

/** A titled grid of project cards. */
export function ProjectGrid({ title, projects, missing, ...actions }: ProjectGridProps) {
  if (projects.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            missing={missing.has(project.id)}
            {...actions}
          />
        ))}
      </div>
    </section>
  );
}
