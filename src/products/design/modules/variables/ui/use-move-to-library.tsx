import { useState } from "react";

import {
  libraryIdOf,
  moveToLibrary,
  planLibraryMove,
  type LibraryDocument,
  type LibraryMovePlan,
} from "@canvas";
import { useProjectLibrariesState } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { ConfirmDialog } from "@shared/ui/kit";
import type { MoveToLibrary } from "./variables-ui.types";
import { t } from "../variables.i18n";

/**
 * Moving the file's own variables, collections or styles `ids` to a library the file uses, while
 * the project's libraries are open: `targets` (none for a library's items or a file without
 * libraries) for a right-click menu, and the `dialog` to render, which says what goes first (a
 * variable takes its whole collection). A move whose items read variables staying in the file is
 * refused with a toast naming them.
 */
export function useMoveToLibrary(ids: readonly string[]): MoveToLibrary {
  const { doc } = useDesignEngine();
  const { status, hub, libraries } = useProjectLibrariesState();
  const [pending, setPending] = useState<{ library: LibraryDocument; plan: LibraryMovePlan }>();
  const nameOf = (library: LibraryDocument) =>
    hub?.entries().find((entry) => entry.id === library.id)?.name ?? library.name();
  const local = ids.every((id) => {
    const record = doc.tokenRecord(id);
    return record !== undefined && libraryIdOf(record) === undefined;
  });

  const ask = (library: LibraryDocument) => {
    const plan = planLibraryMove(doc, ids, library.id);
    if (plan.records.length === 0) return;
    if (plan.blockers.length > 0) {
      toast({
        tone: "error",
        title: t("move.refusedTitle", { library: nameOf(library) }),
        description: t("move.refused", {
          names: plan.blockers.map((record) => `“${record.name}”`).join(", "),
        }),
      });
      return;
    }
    setPending({ library, plan });
  };
  const move = () => {
    if (!pending) return;
    try {
      moveToLibrary(doc, ids, pending.library.id);
    } catch (error) {
      notifyError(t("move.failed"), error);
    }
  };

  const targets =
    status === "ready" && local
      ? libraries.map((library) => ({
          id: library.id,
          label: t("move.to", { library: nameOf(library) }),
          select: () => ask(library),
        }))
      : [];
  const library = pending ? nameOf(pending.library) : "";
  const collection = pending?.plan.collections[0];
  const style = pending?.plan.styles[0];
  const dialog = (
    <ConfirmDialog
      open={pending !== undefined}
      onOpenChange={(open) => !open && setPending(undefined)}
      title={t("move.title", { library })}
      description={`${
        collection
          ? t("move.collection", {
              collection: collection.name,
              count: pending?.plan.variables ?? 0,
              library,
            })
          : t("move.style", { style: style?.name ?? "", library })
      } ${t("move.shared")}`}
      confirmLabel={t("move.confirm")}
      onConfirm={move}
    />
  );
  return { targets, dialog };
}
