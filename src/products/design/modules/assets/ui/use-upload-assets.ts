import {
  addLocalAsset,
  assetKindOf,
  contentHash,
  imageSize,
  keyBetween,
  localAssets,
  type LibraryAsset,
} from "@canvas";
import { useProjectLibrariesState } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { pickImageFiles } from "@platform";
import { createId, extensionOf, imageExtension, type ImageFile } from "@shared/core";
import { notifyError, toast } from "@shared/stores/toast-store";
import { t } from "../assets.i18n";

/** A picked file's name without its extension. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/**
 * Asks for pictures (PNG, JPG, SVG, …) and adds them to a library of the project (`libraryId`) or
 * to the file (`null`), in `group`. A picture the target has already (same bytes) is skipped (and
 * not counted in the toast); one that can't be read says so and the others still go in. A file
 * name without an extension gets its media type's.
 */
export function useUploadAssets(): (libraryId: string | null, group: string) => Promise<void> {
  const engine = useDesignEngine();
  const { hub } = useProjectLibrariesState();

  /** Adds one picture; `false` when the target had it already. */
  const addOne = async (
    file: ImageFile,
    libraryId: string | null,
    group: string,
  ): Promise<boolean> => {
    const size = await imageSize(file.data);
    if (!size) throw new Error(t("error.unreadable", { name: file.name }));
    const input = {
      name: baseName(file.name),
      group,
      type: file.type === "image/svg+xml" ? ("svg" as const) : ("image" as const),
      mime: file.type,
      ext: extensionOf(file.name) || imageExtension(file.type),
      width: size.width,
      height: size.height,
    };
    if (libraryId !== null) {
      if (!hub) throw new Error("The project's libraries aren't open");
      const had = new Set(
        hub
          .library(libraryId)
          ?.assets()
          .map((asset) => asset.id),
      );
      const asset = await hub.addAssetFile(libraryId, file.data, input);
      return !had.has(asset.id);
    }
    const hash = await contentHash(file.data);
    const known = localAssets(engine.doc);
    if (known.some((asset) => asset.hash === hash)) return false;
    const asset: LibraryAsset = {
      ...input,
      id: createId(),
      hash,
      kind: assetKindOf(input.type),
      order: keyBetween(known.at(-1)?.order ?? null, null),
    };
    addLocalAsset(engine.doc, asset, file.data);
    return true;
  };

  return async (libraryId, group) => {
    let files: ImageFile[];
    try {
      files = await pickImageFiles({ title: t("upload.title"), multiple: true });
    } catch (error) {
      notifyError(t("error.upload"), error);
      return;
    }
    let added = 0;
    for (const file of files) {
      try {
        if (await addOne(file, libraryId, group)) added++;
      } catch (error) {
        notifyError(t("error.upload"), error);
      }
    }
    if (added > 0) toast({ title: t("upload.done", { count: added }) });
  };
}
