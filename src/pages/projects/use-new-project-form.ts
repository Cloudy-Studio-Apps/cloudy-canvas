import { useEffect, useState } from "react";

import { openFile, pickFolder, pickImageFiles, projectFs } from "@platform";
import { isReservedName, type ImageFile } from "@shared/core";
import { resolveProjectsFolder } from "@shared/stores/projects-settings-store";
import { notifyError } from "@shared/stores/toast-store";
import { projectRootFor } from "./create-project";
import type { FirstLibrarySource } from "./create-project.types";
import { firstLibraryRecords } from "./first-library";
import type { StylesSource, StylesSourceKind } from "./use-new-project-form.types";
import { randomProjectColor } from "@pages/shared/projects";
import { t } from "./projects.i18n";

/** The New project dialog's fields and what's wrong with them. Mount it when the dialog opens. */
export function useNewProjectForm() {
  const [name, setName] = useState("");
  const [color, setColor] = useState(randomProjectColor);
  const [iconImage, setIconImage] = useState<ImageFile | null>(null);
  const [parent, setParent] = useState<string | null>(null);
  const [styles, setStyles] = useState<StylesSource>({ kind: "empty" });
  // The folder known to exist already, so `taken` follows the name without resetting anything.
  const [takenRoot, setTakenRoot] = useState<string | null>(null);

  useEffect(() => {
    resolveProjectsFolder().then(setParent, (error: unknown) =>
      notifyError(t("dialog.createFailed"), error),
    );
  }, []);

  const trimmed = name.trim();
  const invalid = trimmed !== "" && isReservedName(trimmed);
  const root =
    parent !== null && trimmed !== "" && !invalid ? projectRootFor(parent, trimmed) : null;

  // The folder to create may already be there.
  useEffect(() => {
    if (!root) return;
    let cancelled = false;
    void projectFs.exists(root).then((exists) => {
      if (!cancelled) setTakenRoot(exists ? root : null);
    });
    return () => {
      cancelled = true;
    };
  }, [root]);
  const taken = root !== null && takenRoot === root;

  const changeParent = async () => {
    try {
      const picked = await pickFolder(t("dialog.pickLocation"));
      if (picked) setParent(picked);
    } catch (error) {
      notifyError(t("dialog.createFailed"), error);
    }
  };

  const pickIcon = async () => {
    try {
      const [picked] = await pickImageFiles({ title: t("dialog.iconPick"), multiple: false });
      if (picked) setIconImage(picked);
    } catch (error) {
      notifyError(t("dialog.createFailed"), error);
    }
  };

  /** Switches where the styles start from; a file or tokens source asks for its file first. */
  const chooseStyles = async (kind: StylesSourceKind) => {
    if (kind === "empty") {
      setStyles({ kind });
      return;
    }
    try {
      const picked = await openFile(
        kind === "file"
          ? {
              title: t("dialog.stylesPickFile"),
              filters: [{ name: t("dialog.filterDesignBoard"), extensions: ["cdesign", "cboard"] }],
            }
          : {
              title: t("dialog.stylesPickTokens"),
              filters: [{ name: t("dialog.filterJson"), extensions: ["json"] }],
            },
      );
      if (!picked) return;
      const source = sourceOf(kind, picked.bytes);
      // Reading it now flags a file that has no styles to give before the project is created.
      firstLibraryRecords(source);
      setStyles({ kind, name: picked.name, bytes: picked.bytes });
    } catch (error) {
      notifyError(t("dialog.stylesReadFailed"), error);
    }
  };

  const firstLibrary: FirstLibrarySource =
    styles.kind === "empty" ? "empty" : sourceOf(styles.kind, styles.bytes);

  return {
    styles,
    chooseStyles,
    firstLibrary,
    iconImage,
    pickIcon,
    clearIcon: () => setIconImage(null),
    name,
    setName,
    color,
    setColor,
    parent,
    changeParent,
    root,
    invalid,
    taken,
    ready: parent !== null && trimmed !== "" && !invalid && !taken,
  };
}

function sourceOf(kind: Exclude<StylesSourceKind, "empty">, bytes: Uint8Array): FirstLibrarySource {
  return kind === "file" ? { fromFile: bytes } : { fromTokensJson: bytes };
}
