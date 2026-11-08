import { useState } from "react";

import { AppDialog, Button, Field, Input } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { useProjectContext } from "../project-context";
import { renameError } from "../project-rel";
import type { ProjectDialogProps } from "./project-dialog.types";
import { t } from "../project.i18n";

/** Rename project: the name in the manifest and the `.cproject` file; the folder keeps its name. */
export function RenameProjectDialog(props: ProjectDialogProps) {
  return props.open ? <RenameForm {...props} /> : null;
}

function RenameForm({ open, onOpenChange }: ProjectDialogProps) {
  const { manifest, project } = useProjectContext();
  const [name, setName] = useState(manifest.name);
  const [saving, setSaving] = useState(false);
  const error = name.trim() === "" ? null : renameError(name);
  const ready = name.trim() !== "" && error === null && !saving;

  const save = async () => {
    if (!ready) return;
    setSaving(true);
    try {
      await project.renameProject(name);
      onOpenChange(false);
    } catch (failure) {
      notifyError(t("rename.failed"), failure);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("rename.title")}
      description={t("rename.description")}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("rename.cancel")}
          </Button>
          <Button disabled={!ready} onClick={() => void save()}>
            {t("rename.save")}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Field label={t("rename.name")} error={error ?? undefined}>
          {(id) => (
            <Input
              id={id}
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>
      </form>
    </AppDialog>
  );
}
