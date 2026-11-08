import { useEffect, useState } from "react";

import { pickFolder, pickImageFiles, projectFs } from "@platform";
import { isReservedName, type ImageFile } from "@shared/core";
import { resolveProjectsFolder } from "@shared/stores/projects-settings-store";
import { notifyError } from "@shared/stores/toast-store";
import { projectRootFor } from "./create-project";
import {
  librarySourceOf,
  pickStylesSource,
  randomProjectColor,
  type StylesSource,
  type StylesSourceKind,
} from "@pages/shared/projects";
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
      const source = await pickStylesSource(kind, {
        pickFile: t("dialog.stylesPickFile"),
        pickTokens: t("dialog.stylesPickTokens"),
        filterDesignBoard: t("dialog.filterDesignBoard"),
        filterJson: t("dialog.filterJson"),
      });
      if (source) setStyles(source);
    } catch (error) {
      notifyError(t("dialog.stylesReadFailed"), error);
    }
  };

  const firstLibrary = librarySourceOf(styles);

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
