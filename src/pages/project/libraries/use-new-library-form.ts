import { useState } from "react";

import { librarySourceOf, pickStylesSource } from "@pages/shared/projects";
import { notifyError } from "@shared/stores/toast-store";
import { useProjectContext } from "../project-context";
import { libraryNameProblem } from "./library-names";
import type { NewLibraryInput } from "./use-library-actions.types";
import type { LibraryStart, LibraryStartChoice } from "./use-new-library-form.types";
import { t } from "../project.i18n";

/** The New library dialog's fields and what's wrong with them. Mount it when the dialog opens. */
export function useNewLibraryForm() {
  const { manifest, libs } = useProjectContext();
  const [name, setName] = useState("");
  const [start, setStart] = useState<LibraryStartChoice>({ kind: "empty" });
  const [autoAdd, setAutoAdd] = useState(true);

  const problem = libraryNameProblem(name, manifest.libraries);

  /** Switches where the library starts from; a file or tokens JSON asks for its file first. */
  const chooseStart = async (kind: LibraryStart) => {
    if (kind === "empty") setStart({ kind });
    else if (kind === "copy") {
      const first = libs.summaries[0]?.entry.id;
      if (first) setStart({ kind, libraryId: first });
    } else {
      try {
        const picked = await pickStylesSource(kind, {
          pickFile: t("libraries.pickFile"),
          pickTokens: t("libraries.pickTokens"),
          filterDesignBoard: t("libraries.filterDesignBoard"),
          filterJson: t("libraries.filterJson"),
        });
        if (picked) setStart(picked);
      } catch (error) {
        notifyError(t("libraries.importFailed"), error);
      }
    }
  };

  const input: NewLibraryInput = {
    name,
    autoAdd,
    source: start.kind === "copy" ? { copyOf: start.libraryId } : librarySourceOf(start),
  };

  return {
    name,
    setName,
    problem,
    start,
    chooseStart,
    copyOf: start.kind === "copy" ? start.libraryId : null,
    setCopyOf: (libraryId: string) => setStart({ kind: "copy", libraryId }),
    autoAdd,
    setAutoAdd,
    input,
    ready: name.trim() !== "" && problem === null,
  };
}
