import { useMemo } from "react";
import { useNavigate } from "react-router";

import { imageSize, keyBetween, LibraryDocument } from "@canvas";
import { pickImageFiles, projectFs } from "@platform";
import { baseNameFromPath, createId, projectPaths, type LibraryEntry } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import {
  firstLibraryRecords,
  imageExtension,
  librarySourceOf,
  pickStylesSource,
  type FirstLibrarySource,
} from "@pages/shared/projects";
import { copyLibraryRecords } from "./copy-library-records";
import {
  isLibraryRel,
  newLibraryEntry,
  matchRestoredAssets,
  renameLibraryFiles,
  revertLibraryRename,
  trashLibraryFiles,
} from "./library-files";
import type { LibraryActions, LibraryActionsOptions } from "./use-library-actions.types";
import { t } from "../project.i18n";

/** The ordering key after the manifest's last library. */
function lastOrder(entries: readonly LibraryEntry[]): string {
  return keyBetween(
    entries
      .map((e) => e.order)
      .sort()
      .at(-1) ?? null,
    null,
  );
}

/** What can be done with a project's libraries: make, rename, remove, fill, edit in a file. */
export function useLibraryActions(options: LibraryActionsOptions): LibraryActions {
  const { record, manifest, project, libs, recent, bump } = options;
  const { hub, reload } = libs;
  const navigate = useNavigate();

  return useMemo<LibraryActions>(() => {
    const attempt = async <T>(title: string, run: () => Promise<T>): Promise<T | null> => {
      try {
        return await run();
      } catch (error) {
        notifyError(title, error);
        return null;
      }
    };

    /** A source's records; a copy of a library also gets new ids. */
    const recordsOf = (source: FirstLibrarySource | { copyOf: string }) => {
      if (typeof source === "object" && "copyOf" in source) {
        const from = hub?.library(source.copyOf);
        if (!from) throw new Error("That library isn't loaded");
        return copyLibraryRecords(from.tokenRecords());
      }
      return firstLibraryRecords(source);
    };

    return {
      create: (input) =>
        attempt(t("libraries.createFailed"), async () => {
          if (!hub) throw new Error("The project's libraries aren't open yet");
          const records = recordsOf(input.source);
          const entry = await newLibraryEntry(record.root, input.name, input.autoAdd);
          await project.saveManifest({ libraries: [...manifest.libraries, entry] });
          await reload();
          const doc = hub.library(entry.id);
          if (!doc)
            throw new Error(`The library "${input.name}" couldn't be read after it was made`);
          if (records.length > 0) doc.setTokenRecords(records);
          if (typeof input.source === "object" && "copyOf" in input.source) {
            for (const asset of hub.library(input.source.copyOf)?.assets() ?? []) {
              const bytes = await hub.readAssetBytes(input.source.copyOf, asset.id);
              await hub.addAssetFile(entry.id, bytes, {
                name: asset.name,
                group: asset.group,
                type: asset.type,
                mime: asset.mime,
                ext: asset.ext,
                width: asset.width,
                height: asset.height,
              });
            }
          }
          bump();
          return entry;
        }),
      rename: async (library, raw) => {
        const name = raw.trim();
        if (name === library.entry.name) return true;
        const done = await attempt(t("libraries.renameFailed"), async () => {
          // Its pending save is written first and later edits wait, so none lands on the old name.
          const release = (await hub?.hold(library.entry.id)) ?? (() => {});
          try {
            const file = await renameLibraryFiles(record.root, manifest, library.entry, name);
            try {
              await project.saveManifest({
                libraries: manifest.libraries.map((l) =>
                  l.id === library.entry.id ? { ...l, name, file } : l,
                ),
              });
            } catch (error) {
              await revertLibraryRename(record.root, file, library.entry.file).catch(() => {});
              throw error;
            }
            await reload();
            return true;
          } finally {
            release();
          }
        });
        return done === true;
      },
      remove: async (library) => {
        await attempt(t("libraries.removeFailed"), async () => {
          // Out of the manifest first, so the hub lets go of it (and its pending save) before
          // the files move.
          await project.saveManifest({
            libraries: manifest.libraries.filter((l) => l.id !== library.entry.id),
          });
          await reload();
          await trashLibraryFiles(record.root, library.entry);
          bump();
          toast({ title: t("libraries.removed", { name: library.entry.name }) });
        });
      },
      setAutoAdd: async (library, autoAdd) => {
        await attempt(t("libraries.updateFailed"), async () => {
          await project.saveManifest({
            libraries: manifest.libraries.map((l) =>
              l.id === library.entry.id ? { ...l, autoAdd } : l,
            ),
          });
          await reload();
        });
      },
      addAssets: async (library) => {
        await attempt(t("libraries.addFailed"), async () => {
          if (!hub) return;
          const picked = await pickImageFiles({ title: t("libraries.pickImages"), multiple: true });
          for (const file of picked) {
            const size = (await imageSize(file.data)) ?? { width: 0, height: 0 };
            await hub.addAssetFile(library.entry.id, file.data, {
              name: file.name,
              group: "",
              type: file.type === "image/svg+xml" ? "svg" : "image",
              mime: file.type,
              ext: imageExtension(file.type),
              width: size.width,
              height: size.height,
            });
          }
        });
      },
      importStyles: async (library, kind) => {
        await attempt(t("libraries.importFailed"), async () => {
          const source = await pickStylesSource(kind, {
            pickFile: t("libraries.pickFile"),
            pickTokens: t("libraries.pickTokens"),
            filterDesignBoard: t("libraries.filterDesignBoard"),
            filterJson: t("libraries.filterJson"),
          });
          if (!source) return;
          const records = firstLibraryRecords(librarySourceOf(source));
          library.doc.setTokenRecords(records);
          toast({ title: t("libraries.imported", { count: records.length, name: source.name }) });
        });
      },
      editInFile: () => {
        const latest = recent.find((file) => file.projectId === record.id) ?? recent[0];
        if (!latest) {
          // The editor links a new design to the project (`project=`) and its libraries.
          const dir = encodeURIComponent(record.root);
          void navigate(`/design/${createId()}?dir=${dir}&project=${record.id}`);
          return;
        }
        void attempt(t("libraries.editFailed"), async () => {
          const file = await useRecentFilesStore.getState().open(latest.path);
          await navigate(`/${file.type}/${file.id}`);
        });
      },
      adoptRestored: async (rel, from) => {
        if (!isLibraryRel(rel)) return;
        const file = baseNameFromPath(rel);
        if (manifest.libraries.some((l) => l.file === file)) return;
        const bytes = await projectFs.readBytes(projectPaths(record.root).library(file));
        const doc = LibraryDocument.fromFile(bytes);
        if (manifest.libraries.some((l) => l.id === doc.id)) return;
        const entry: LibraryEntry = {
          id: doc.id,
          name: file.replace(/\.clib$/i, ""),
          file,
          order: lastOrder(manifest.libraries),
          autoAdd: false,
        };
        await matchRestoredAssets(record.root, file, from);
        await project.saveManifest({ libraries: [...manifest.libraries, entry] });
        await reload();
      },
    };
  }, [record, manifest, project, hub, reload, recent, bump, navigate]);
}
