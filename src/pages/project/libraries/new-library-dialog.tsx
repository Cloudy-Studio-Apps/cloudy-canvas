import { useState } from "react";

import { AppDialog, Button, Field, Input, SelectField, SwitchField } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import type { NewLibraryDialogProps } from "./library-dialogs.types";
import type { LibraryStart } from "./use-new-library-form.types";
import { useNewLibraryForm } from "./use-new-library-form";
import { t } from "../project.i18n";

/** Name, where the library starts from (empty, a file's styles, a copy, a tokens JSON) and whether files take it. */
export function NewLibraryDialog(props: NewLibraryDialogProps) {
  // The form starts fresh each time the dialog opens.
  return props.open ? <NewLibraryForm {...props} /> : null;
}

function NewLibraryForm({ open, onOpenChange }: NewLibraryDialogProps) {
  const { libs, libraryActions, nav } = useProjectContext();
  const form = useNewLibraryForm();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!form.ready || creating) return;
    setCreating(true);
    const entry = await libraryActions.create(form.input);
    setCreating(false);
    if (entry) {
      onOpenChange(false);
      nav.openLibrary(entry.id);
    }
  };

  const starts: { value: LibraryStart; label: string }[] = [
    { value: "empty", label: t("libraries.dialog.startEmpty") },
    { value: "file", label: t("libraries.dialog.startFile") },
    ...(libs.summaries.length > 0
      ? [{ value: "copy" as const, label: t("libraries.dialog.startCopy") }]
      : []),
    { value: "tokens", label: t("libraries.dialog.startTokens") },
  ];

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("libraries.dialog.title")}
      description={t("libraries.dialog.description")}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("rename.cancel")}
          </Button>
          <Button disabled={!form.ready || creating} onClick={() => void create()}>
            {creating ? t("libraries.dialog.creating") : t("libraries.dialog.create")}
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
          label={t("libraries.name")}
          error={
            form.problem
              ? t(form.problem === "invalid" ? "libraries.nameInvalid" : "libraries.nameTaken")
              : undefined
          }
        >
          {(id) => (
            <Input
              id={id}
              autoFocus
              value={form.name}
              placeholder={t("libraries.dialog.namePlaceholder")}
              onChange={(event) => form.setName(event.target.value)}
            />
          )}
        </Field>
        <SelectField
          layout="stacked"
          label={t("libraries.dialog.start")}
          value={form.start.kind}
          options={starts}
          onChange={(kind) => void form.chooseStart(kind)}
        />
        {form.start.kind !== "empty" && form.start.kind !== "copy" && (
          <p className="text-xs text-muted-foreground">
            {t("libraries.dialog.chosen", { name: form.start.name })}
          </p>
        )}
        {form.copyOf !== null && (
          <SelectField
            layout="stacked"
            label={t("libraries.dialog.copyOf")}
            value={form.copyOf}
            options={libs.summaries.map((s) => ({ value: s.entry.id, label: s.entry.name }))}
            onChange={form.setCopyOf}
          />
        )}
        <SwitchField
          label={t("libraries.dialog.autoAdd")}
          checked={form.autoAdd}
          onChange={form.setAutoAdd}
        />
        <p className="-mt-2 text-xs text-muted-foreground">{t("libraries.dialog.autoAddHint")}</p>
      </form>
    </AppDialog>
  );
}
