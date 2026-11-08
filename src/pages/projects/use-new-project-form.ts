import { useEffect, useState } from "react";

import { pickFolder, pickImageFiles } from "@platform";
import { isReservedName, type ImageFile } from "@shared/core";
import { resolveProjectsFolder } from "@shared/stores/projects-settings-store";
import { notifyError } from "@shared/stores/toast-store";
import { projectRootFor } from "./create-project";
import { useFolderStatus } from "./use-folder-status";
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
  // The projects folder a new project's folder goes in until a folder is chosen or typed.
  const [base, setBase] = useState<string | null>(null);
  // The project folder itself, once chosen or typed (as JetBrains IDEs do); null: follow the name.
  const [chosen, setChosen] = useState<string | null>(null);
  const [styles, setStyles] = useState<StylesSource>({ kind: "empty" });

  useEffect(() => {
    resolveProjectsFolder().then(setBase, (error: unknown) =>
      notifyError(t("dialog.createFailed"), error),
    );
  }, []);

  const trimmed = name.trim();
  const invalid = trimmed !== "" && isReservedName(trimmed);
  const location =
    chosen ?? (base !== null && trimmed !== "" && !invalid ? projectRootFor(base, trimmed) : null);
  const root = location !== null && location.trim() !== "" ? location.trim() : null;
  const folder = useFolderStatus(root);

  const changeLocation = async () => {
    try {
      const picked = await pickFolder(t("dialog.pickLocation"));
      if (picked) setChosen(picked);
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
    /** The project folder shown in the Location field (follows the name until one is chosen). */
    location: location ?? "",
    /** Typing a path chooses it; clearing the field follows the name again. */
    setLocation: (text: string) => setChosen(text === "" ? null : text),
    /** Where the folder goes while there's no name yet. */
    locationPlaceholder: base !== null ? projectRootFor(base, t("dialog.namePlaceholder")) : "",
    changeLocation,
    root,
    folder,
    invalid,
    ready: root !== null && trimmed !== "" && !invalid && folder !== null && folder !== "project",
  };
}
