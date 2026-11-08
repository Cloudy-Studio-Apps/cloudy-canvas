import { useEffect, useState } from "react";

import { defaultProjectsFolder, pickFolder, projectFs } from "@platform";
import { isReservedName } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { projectRootFor } from "./create-project";
import { randomProjectColor } from "./project-colors";
import { t } from "./projects.i18n";

/** The New project dialog's fields and what's wrong with them. Mount it when the dialog opens. */
export function useNewProjectForm() {
  const [name, setName] = useState("");
  const [color, setColor] = useState(randomProjectColor);
  const [parent, setParent] = useState<string | null>(null);
  // The folder known to exist already, so `taken` follows the name without resetting anything.
  const [takenRoot, setTakenRoot] = useState<string | null>(null);

  useEffect(() => {
    defaultProjectsFolder().then(setParent, (error: unknown) =>
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

  return {
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
