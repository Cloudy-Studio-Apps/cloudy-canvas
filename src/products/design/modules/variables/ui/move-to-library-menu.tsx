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
import {
  ConfirmDialog,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import type { MoveToLibraryMenuProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

/**
 * Right-click → Move to a library, on the file's own variables, collections and styles `ids`
 * while the project's libraries are open: a variable moves its whole collection, which it says
 * before moving; a move whose items read variables staying in the file is refused, naming them.
 * Library items, and files without libraries, get no menu.
 */
export function MoveToLibraryMenu({ ids, children }: MoveToLibraryMenuProps) {
  const { doc } = useDesignEngine();
  const { status, hub, libraries } = useProjectLibrariesState();
  const [pending, setPending] = useState<{ library: LibraryDocument; plan: LibraryMovePlan }>();
  const local = ids.every((id) => {
    const record = doc.tokenRecord(id);
    return record !== undefined && libraryIdOf(record) === undefined;
  });
  if (status !== "ready" || libraries.length === 0 || !local) return children;

  const nameOf = (library: LibraryDocument) =>
    hub?.entries().find((entry) => entry.id === library.id)?.name ?? library.name();
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

  const library = pending ? nameOf(pending.library) : "";
  const collection = pending?.plan.collections[0];
  const style = pending?.plan.styles[0];
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {libraries.map((item) => (
            <ContextMenuItem key={item.id} onSelect={() => ask(item)}>
              {t("move.to", { library: nameOf(item) })}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
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
    </>
  );
}
