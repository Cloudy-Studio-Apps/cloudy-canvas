import {
  applyLibraryMerge,
  localAssets,
  moveAssetToLibrary,
  planLibraryMerge,
  type CanvasDocument,
  type MergePlan,
} from "@canvas";
import { LibraryHub, type OpenedHub } from "@canvas-ui";
import { projectFs, storage } from "@platform";
import { displayName, type FileInfo, type ProjectRecord } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { libraryColorList } from "@pages/shared/projects";
import { t } from "./add-to-project.i18n";
import { FILE_CODECS } from "./file-codecs";
import type { FileCodec } from "./file-codecs.types";
import type { MergeCommit, MergeLibrary } from "./merge-session.types";
import { targetPath } from "./target-path";

/**
 * A file being added to a project, outside any editor: its document (opened with its product's
 * migrations) and the project's library hub, held until `close`. `plan` says what its styles do
 * in a library; `commit` carries it out and moves the file.
 */
export class MergeSession {
  /** Opens the file and the project's libraries. */
  static async open(file: FileInfo, project: ProjectRecord): Promise<MergeSession> {
    const codec = FILE_CODECS[file.type];
    const doc = codec.open(await storage.load(file.id));
    try {
      return new MergeSession(file, project, codec, doc, await LibraryHub.open(project));
    } catch (error) {
      doc.destroy();
      throw error;
    }
  }

  private readonly colors = new Map<string, string>();
  private closed = false;
  private committing: Promise<FileInfo> | null = null;

  private constructor(
    readonly file: FileInfo,
    readonly project: ProjectRecord,
    private readonly codec: FileCodec,
    private readonly doc: CanvasDocument,
    private readonly opened: OpenedHub,
  ) {
    const records = [doc.tokenRecords(), ...opened.hub.libraries().map((l) => l.tokenRecords())];
    for (const list of records) {
      for (const { id, color } of libraryColorList(list)) this.colors.set(id, color);
    }
  }

  /** The project the file says it's in already (its link); `null` for a loose file. */
  linkedProject(): string | null {
    return this.doc.projectLink()?.projectId ?? null;
  }

  /**
   * The libraries the file's styles can go to: those every file of the project uses (`autoAdd`,
   * which the file's `"all"` link takes) that could be read, in the project's order.
   */
  libraries(): MergeLibrary[] {
    const { hub } = this.opened;
    return hub.entries().filter((entry) => entry.autoAdd && hub.library(entry.id));
  }

  /** How many pictures the file has of its own (they go to the library too). */
  pictures(): number {
    return localAssets(this.doc).length;
  }

  /** A color variable's value (the file's or a library's), for the clash rows. */
  colorOf(id: string): string | null {
    return this.colors.get(id) ?? null;
  }

  /** What the file's styles and pictures do in library `libraryId`. */
  plan(libraryId: string): MergePlan | null {
    const library = this.opened.hub.library(libraryId);
    if (!library) return null;
    const assets = localAssets(this.doc).map(({ id, hash, name }) => ({ id, hash, name }));
    return planLibraryMerge(
      this.doc.tokenRecords(),
      library.tokenRecords(),
      assets,
      library.assets(),
      displayName(this.file),
    );
  }

  /**
   * Merges the file's styles and pictures into the library (saved before anything else), links
   * the file to the project and writes it into `folder`: in place when it's there already, else
   * as a new file there, the recent files pointed at it (same id), and then the original deleted.
   * A failure before the copy is written leaves the original as it was. Returns the file's entry.
   * A session commits once; `close` waits for it.
   */
  commit(input: MergeCommit): Promise<FileInfo> {
    if (this.closed || this.committing) {
      return Promise.reject(new Error("This file was added or closed already"));
    }
    this.committing = this.write(input);
    return this.committing;
  }

  /** Lets go of the document and the libraries, after a commit running (a second call does nothing). */
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await this.committing?.catch(() => undefined);
    this.doc.destroy();
    await this.opened.release();
  }

  private async write({ folder, libraryId, plan }: MergeCommit): Promise<FileInfo> {
    const { doc, codec, file, project } = this;
    const { hub } = this.opened;
    if (libraryId !== null && plan !== null) {
      const library = hub.library(libraryId);
      if (!library) throw new Error(`The library ${libraryId} couldn't be read`);
      doc.setAfterEdit(codec.afterEdit());
      try {
        const relink = codec.relink;
        for (const asset of localAssets(doc)) {
          await moveAssetToLibrary(
            doc,
            hub,
            asset.id,
            libraryId,
            relink ? (from, to) => relink(doc, from, to) : undefined,
          );
        }
        applyLibraryMerge(doc, library, plan);
      } finally {
        doc.setAfterEdit(null);
      }
      await hub.flush(libraryId);
    }
    doc.setProjectLink({ projectId: project.id, libraryIds: "all" });
    const path = await targetPath(project.root, folder, file, codec.untitled());
    const { title, description } = doc.meta();
    const saved = await storage.save(file.id, path, codec.encode(doc), {
      title,
      description,
      projectId: project.id,
    });
    // A draft's own file went with the save; another file's original goes now.
    if (path !== file.path && !file.draft) {
      try {
        await projectFs.removeFile(file.path);
      } catch (error) {
        notifyError(t("failed.original", { path: file.path }), error);
      }
    }
    return saved;
  }
}
