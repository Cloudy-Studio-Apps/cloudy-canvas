import { lazy, Suspense, useState } from "react";

import type { FileInfo } from "@shared/core";
import { AddToProjectContext } from "./add-to-project-context";
import type { AddToProjectProviderProps } from "./add-to-project-context.types";

// Loaded the first time a file is added, so the page holding the provider stays light.
const AddToProjectDialog = lazy(() =>
  import("./add-to-project-dialog").then((module) => ({ default: module.AddToProjectDialog })),
);

/** Lets what's inside it open the Add to project dialog (`useAddToProject`), and shows it. */
export function AddToProjectProvider({
  children,
  project,
  folder,
  onAdded,
}: AddToProjectProviderProps) {
  const [file, setFile] = useState<FileInfo | null>(null);
  return (
    <AddToProjectContext.Provider value={setFile}>
      {children}
      {file && (
        <Suspense fallback={null}>
          <AddToProjectDialog
            file={file}
            project={project}
            folder={folder}
            onClose={() => setFile(null)}
            onAdded={onAdded}
          />
        </Suspense>
      )}
    </AddToProjectContext.Provider>
  );
}
