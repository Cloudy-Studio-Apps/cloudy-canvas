import { useState } from "react";

import { ColorPopover } from "@canvas-ui";
import {
  AppDialog,
  Button,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { createProject } from "../create-project";
import { useNewProjectForm } from "../use-new-project-form";
import { ProjectIcon } from "./project-icon";
import type { NewProjectDialogProps } from "./new-project-dialog.types";
import { t } from "../projects.i18n";

/** Name, color, location and where the styles start from; Create makes the project's folder. */
export function NewProjectDialog(props: NewProjectDialogProps) {
  // The form starts fresh each time the dialog opens.
  return props.open ? <NewProjectForm {...props} /> : null;
}

function NewProjectForm({ open, onOpenChange, onCreated }: NewProjectDialogProps) {
  const form = useNewProjectForm();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!form.ready || form.parent === null) return;
    setCreating(true);
    try {
      const project = await createProject({
        name: form.name,
        color: form.color,
        icon: null,
        parent: form.parent,
        firstLibrary: "empty",
      });
      onOpenChange(false);
      onCreated(project);
    } catch (error) {
      notifyError(t("dialog.createFailed"), error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("dialog.title")}
      description={t("dialog.description")}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button disabled={!form.ready || creating} onClick={() => void create()}>
            {creating ? t("dialog.creating") : t("dialog.create")}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <Field
          label={t("dialog.name")}
          error={
            form.invalid ? t("dialog.nameInvalid") : form.taken ? t("dialog.nameTaken") : undefined
          }
        >
          {(id) => (
            <Input
              id={id}
              autoFocus
              value={form.name}
              placeholder={t("dialog.namePlaceholder")}
              onChange={(event) => form.setName(event.target.value)}
            />
          )}
        </Field>
        <Field label={t("dialog.color")}>
          <div className="flex items-center gap-2">
            <ProjectIcon name={form.name || " "} color={form.color} />
            <ColorPopover
              color={form.color}
              label={t("dialog.colorLabel")}
              onChange={(next) => form.setColor(next.color)}
            />
          </div>
        </Field>
        <Field
          label={t("dialog.location")}
          hint={form.root ? t("dialog.locationHint", { path: form.root }) : undefined}
        >
          {(id) => (
            <div className="flex items-center gap-2">
              <Input id={id} readOnly value={form.parent ?? ""} className="font-mono text-xs" />
              <Button type="button" variant="outline" onClick={() => void form.changeParent()}>
                {t("dialog.change")}
              </Button>
            </div>
          )}
        </Field>
        <Field label={t("dialog.styles")}>
          {(id) => (
            <Select value="empty">
              <SelectTrigger id={id} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empty">{t("dialog.stylesEmpty")}</SelectItem>
                <SelectItem value="file" disabled title={t("dialog.stylesSoon")}>
                  {t("dialog.stylesFile")}
                </SelectItem>
                <SelectItem value="tokens" disabled title={t("dialog.stylesSoon")}>
                  {t("dialog.stylesTokens")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </Field>
      </form>
    </AppDialog>
  );
}
