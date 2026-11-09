import { useState } from "react";

import { AppDialog, Button, Field, Input } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import type { LibraryDialogProps } from "./library-dialogs.types";
import { libraryNameProblem } from "./library-names";
import { t } from "../project.i18n";

/** Rename library: the name in the manifest and the `.clib` file's name. */
export function RenameLibraryDialog(props: LibraryDialogProps) {
  return props.open ? <RenameForm {...props} /> : null;
}

function RenameForm({ open, onOpenChange, library }: LibraryDialogProps) {
  const { manifest, libraryActions } = useProjectContext();
  const [name, setName] = useState(library.entry.name);
  const [saving, setSaving] = useState(false);
  const problem = libraryNameProblem(name, manifest.libraries, library.entry.id);
  const ready = name.trim() !== "" && problem === null && !saving;

  const save = async () => {
    if (!ready) return;
    setSaving(true);
    if (await libraryActions.rename(library, name)) onOpenChange(false);
    setSaving(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("libraries.rename.title")}
      description={t("libraries.rename.description")}
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
        <Field
          label={t("libraries.name")}
          error={
            problem
              ? t(problem === "invalid" ? "libraries.nameInvalid" : "libraries.nameTaken")
              : undefined
          }
        >
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
