import { useState } from "react";

import { moveAssetToLibrary, removeLocalAsset, localAssets, type LibraryAsset } from "@canvas";
import { useProjectLibrariesState } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { ConfirmDialog } from "@shared/ui/kit";
import type { LocalAssetActions } from "./assets-ui.types";
import { RenameAssetDialog } from "./rename-asset-dialog";
import { t } from "../assets.i18n";

/**
 * The file's own pictures' menu: rename, move to a library the file uses (while the project's
 * libraries are open), and delete a picture no layer shows. Returns the dialogs to render.
 */
export function useLocalAssetActions(): LocalAssetActions {
  const engine = useDesignEngine();
  const { doc } = engine;
  const { status, hub, libraries } = useProjectLibrariesState();
  const [renaming, setRenaming] = useState<LibraryAsset | null>(null);
  const [deleting, setDeleting] = useState<LibraryAsset | null>(null);

  const entries = hub?.entries() ?? [];
  const targets =
    status === "ready"
      ? libraries.map((library) => ({
          id: library.id,
          name: entries.find((entry) => entry.id === library.id)?.name ?? library.name(),
        }))
      : [];

  const isUsed = (assetId: string) =>
    doc.all().some((el) => engine.kinds.kindOf(el).assets(el).includes(assetId));

  const moveTo = (asset: LibraryAsset, libraryId: string) => {
    if (!hub) return;
    const library = targets.find((target) => target.id === libraryId)?.name ?? "";
    moveAssetToLibrary(doc, hub, asset.id, libraryId).then(
      () => toast({ title: t("move.done", { name: asset.name, library }) }),
      (error: unknown) => notifyError(t("error.move"), error),
    );
  };

  const dialogs = (
    <>
      <RenameAssetDialog
        asset={renaming}
        onClose={() => setRenaming(null)}
        onRename={(name) => {
          const current = localAssets(doc).find((item) => item.id === renaming?.id);
          if (current) doc.setAssetIndexEntry({ ...current, name });
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("delete.title", { name: deleting?.name ?? "" })}
        description={t("delete.text")}
        confirmLabel={t("delete.confirm")}
        destructive
        onConfirm={() => deleting && !isUsed(deleting.id) && removeLocalAsset(doc, deleting.id)}
      />
    </>
  );
  return { targets, rename: setRenaming, moveTo, remove: setDeleting, isUsed, dialogs };
}
