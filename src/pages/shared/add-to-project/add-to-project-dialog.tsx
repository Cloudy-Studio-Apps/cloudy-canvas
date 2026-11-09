import { useNavigate } from "react-router";
import { Plus } from "lucide-react";

import { displayName, tCommon } from "@shared/core";
import { AppDialog, Button, ListRow, SelectField } from "@shared/ui/kit";
import { ProjectIcon } from "@pages/shared/projects";
import type {
  AddToProjectDialogProps,
  AddToProjectFormOptions,
} from "./add-to-project-dialog.types";
import { StylesSummary } from "./styles-summary";
import { useAddToProjectForm } from "./use-add-to-project-form";
import { t } from "./add-to-project.i18n";

/**
 * Add to project: the project (or New project…), the folder, the library its new styles go to and
 * each clash with Use project's / Keep both; Add moves the file into the project.
 */
export function AddToProjectDialog({ file, ...props }: AddToProjectDialogProps) {
  // The form starts fresh for each file.
  return file ? <AddToProjectForm key={file.id} file={file} {...props} /> : null;
}

function AddToProjectForm(props: AddToProjectFormOptions) {
  const { file, project: fixed, onClose } = props;
  const navigate = useNavigate();
  const form = useAddToProjectForm(props);
  const { project } = form;

  return (
    <AppDialog
      open
      onOpenChange={(open) => !open && !form.busy && onClose()}
      title={t("dialog.title", { name: displayName(file) })}
      description={t("dialog.description")}
      footer={
        <>
          <Button variant="ghost" disabled={form.busy} onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button disabled={!form.canAdd} onClick={() => void form.add()}>
            {form.busy ? t("dialog.adding") : t("dialog.add")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!fixed && (
          <div role="group" aria-label={t("dialog.projects")} className="rounded-md border p-1">
            {form.projects.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">{t("dialog.noProjects")}</p>
            )}
            {form.projects.map((p) => (
              <ListRow
                key={p.id}
                size="md"
                selected={p.id === project?.id}
                onSelect={() => form.pickProject(p.id)}
                icon={<ProjectIcon name={p.name} color={p.color} size="sm" />}
                label={p.name}
              />
            ))}
            <ListRow
              size="md"
              onSelect={() => {
                onClose();
                void navigate("/projects?new");
              }}
              icon={<Plus />}
              label={t("dialog.newProject")}
            />
          </div>
        )}
        {project && (
          <SelectField
            layout="stacked"
            label={t("dialog.folder")}
            value={form.folder}
            onChange={form.setFolder}
            options={form.folders.map((rel) => ({
              value: rel,
              label: rel === "" ? t("dialog.root") : rel.split("/").join(" / "),
            }))}
            className="w-full"
          />
        )}
        {project && form.libraries.length > 1 && form.libraryId && (
          <SelectField
            layout="stacked"
            label={t("dialog.library")}
            value={form.libraryId}
            onChange={form.setLibraryId}
            options={form.libraries.map((l) => ({ value: l.id, label: l.name }))}
            className="w-full"
          />
        )}
        {project && <StylesSummary form={form} />}
      </div>
    </AppDialog>
  );
}
